import { sleep } from "openai/core";
import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

export class RiyadScrapper extends BaseScrapper {
	urls = new URLS("https://www.riyadbank.com", {
		en_categories: "/personal-banking/credit-cards/offers",
		ar_categories: "/ar/personal-banking/credit-cards/offers",
	});

	constructor(drivers: Drivers) {
		super(drivers);
	}

	// Implement the abstract getOffersDelta method specific to SnbScrapper
	async getOffersDelta(
		dbOffers: Set<string>,
		lang: "ar" | "en"
	): Promise<IDelta> {
		const liveOffers: string[] = [];

		const page = await this.drivers[lang].newPage();
		await this.drivers[lang].goTo(
			page,
			this.urls.getPath(`${lang}_categories`)
		);
		const categoriesLinks = await page.$$(".childContainer a");
		const hrefs = new Set<string>();
		for (const link of categoriesLinks) {
			const url = await link.evaluate((el) => el.getAttribute("href"));
			if (url) hrefs.add(url);
		}

		for (const href of Array.from(hrefs)) {
			const categoryPage = await this.drivers[lang].newPage();
			await this.drivers[lang].goTo(categoryPage, this.urls.baseUrl + href);
			const titleNode = await page.$(".offers-section h4");
			if (!titleNode) continue;
			const title = await titleNode.evaluate((el) => el.textContent);
			if (!title) continue;
			liveOffers.push(title);
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
