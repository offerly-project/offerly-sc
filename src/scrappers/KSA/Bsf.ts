import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	triggerAllLoadMore,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

export class BsfScrapper extends BaseScrapper {
	urls = new URLS("https://bsf.sa", {
		offers_en: "/english/personal/cards/offers/all-offers",
		offers_ar: "/arabic/personal/cards/offers/all-offers",
	});

	constructor(drivers: Drivers) {
		super(drivers);
	}

	// Implement the abstract getOffersDelta method
	async getOffersDelta(
		dbOffers: Set<string>,
		lang: "ar" | "en"
	): Promise<IDelta> {
		const mainPage = await this.drivers[lang].newPage();
		await this.drivers[lang].goTo(
			mainPage,
			this.urls.getPath(`offers_${lang}`)
		);

		const liveOffers: string[] = [];

		await triggerAllLoadMore(mainPage, ".ShowCardLogos .loadMoreBtn a");

		const offerNodes = await mainPage.$$(".cards strong");
		for await (const offerNode of offerNodes) {
			const title = await offerNode.evaluate((el) => el.textContent);
			if (title) {
				liveOffers.push(title);
			}
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
