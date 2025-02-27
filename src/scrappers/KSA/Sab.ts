import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	sleep,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

export class SabScrapper extends BaseScrapper {
	urls = new URLS("https://www.sab.com", {
		categories_en:
			"/en/personal/compare-credit-cards/credit-card-special-offers",
		categories_ar:
			"/ar/personal/compare-credit-cards/credit-card-special-offers",
	});

	constructor(drivers: Drivers) {
		super(drivers);
	}

	// Implement the abstract getOffersDelta method specific to SabScrapper
	async getOffersDelta(
		dbOffers: Set<string>,
		lang: "ar" | "en"
	): Promise<IDelta> {
		const liveOffers: string[] = [];
		const page = await this.drivers[lang].newPage();
		await this.drivers[lang].goTo(
			page,
			this.urls.getPath(`categories_${lang}`)
		);
		const links = await page.$$(".sab-small-cards a");

		for (const link of links) {
			const page = await this.drivers[lang].newPage();
			const href = await link.evaluate((el) => el.getAttribute("href"));
			const fullLink = this.urls.baseUrl + href;

			await this.drivers[lang].goTo(page, fullLink);
			await page.waitForSelector(".sab-cardsListingTab-v3__cards > div");
			const cardsContainerPath = ".sab-cardsListingTab-v3__cards > div"; // The selector for offers cards
			const cardsContainer = await page.$$(cardsContainerPath);

			for (const card of cardsContainer) {
				const titleSelector = ".sab-cardsListingTab-v3__cards-title";

				const titleNode = await card.$(titleSelector);

				if (!titleNode) continue;

				const title = await titleNode.evaluate((el) => el.textContent);

				if (!title) continue;

				liveOffers.push(title);
			}

			await sleep(DRIVER_RATE_LIMIT);
		}

		const scrappedOffers = prepareScrappedOffersToDelta(liveOffers);

		const delta_added = getAddedDelta(dbOffers, scrappedOffers);
		const delta_removed = getRemovedDelta(dbOffers, scrappedOffers);

		return {
			delta_added,
			delta_removed,
		};
	}
}
