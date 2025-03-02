import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	sleep,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

export class AnbScrapper extends BaseScrapper {
	urls = new URLS("https://anb.com.sa", {
		en: "/web/anb/merchant-offers",
		ar: "/ar/web/anb/merchant-offers",
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

		const titleNodes = await page.$$(
			"#tabPanel1 .modal-body > div:last-child > div:first-child"
		);

		for (const item of titleNodes) {
			const title = await item.evaluate((el) => el.textContent);
			if (!title) continue;

			liveOffers.push(title);
		}

		await sleep(DRIVER_RATE_LIMIT);

		const scrappedOffers = prepareScrappedOffersToDelta(liveOffers);

		const delta_added = getAddedDelta(dbOffers, scrappedOffers);
		const delta_removed = getRemovedDelta(dbOffers, scrappedOffers);

		return {
			delta_added,
			delta_removed,
		};
	}
}
