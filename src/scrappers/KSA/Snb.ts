import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	sleep,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

export class SnbScrapper extends BaseScrapper {
	urls = new URLS("https://www.alahli.com", {
		en: "/en/pages/personal-banking/credit-cards/credit-card-promotions/views",
		ar: "/ar/pages/personal-banking/credit-cards/credit-card-promotions/views",
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
		await this.drivers[lang].goTo(page, this.urls.getPath(lang));

		while (true) {
			await page.waitForSelector(".comp-listing .data-wrap");
			const items = await page.$$(".comp-listing .data-wrap");

			for (const item of items) {
				const titleBlock = await item.$(".item_title");
				if (!titleBlock) continue;
				const title = await titleBlock.evaluate((el) => el.textContent);
				if (!title) continue;

				liveOffers.push(title);
			}

			await page.waitForSelector(".next > a");
			const isNextDisabled = await page.$(".next.disabled");
			if (isNextDisabled) break;

			const nextNode = await page.$(".next > a");
			if (!nextNode) break;

			await page.click(".next > a");
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
