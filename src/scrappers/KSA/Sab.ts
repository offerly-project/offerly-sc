import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	sleep,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

const WAIT_TIMEOUT = 1000;

export class SabScrapper extends BaseScrapper {
	urls = new URLS("https://www.sab.com", {
		en_shopping:
			"/en/personal/compare-credit-cards/credit-card-special-offers/shopping/?selected=Shopping",
		en_travel:
			"/en/personal/compare-credit-cards/credit-card-special-offers/travel/?selected=Travel",
		en_dining:
			"/en/personal/compare-credit-cards/credit-card-special-offers/dining-groceries/?selected=Dining%20%26%20Groceries",
		en_lifestyle:
			"/en/personal/compare-credit-cards/credit-card-special-offers/lifestyle/?selected=Lifestyle",
		ar_shopping:
			"/ar/personal/compare-credit-cards/credit-card-special-offers/shopping/?selected=التسوق",
		ar_travel:
			"/ar/personal/compare-credit-cards/credit-card-special-offers/travel/?selected=للسفر%20والسياحة",
		ar_dining:
			"/ar/personal/compare-credit-cards/credit-card-special-offers/dining-groceries/?selected=المطاعم%20وأسواق%20التغذية",
		ar_lifestyle:
			"/ar/personal/compare-credit-cards/credit-card-special-offers/lifestyle/?selected=نمط%20الحياة",
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
		const links =
			lang === "ar"
				? [
						this.urls.getPath("ar_shopping"),
						this.urls.getPath("ar_travel"),
						this.urls.getPath("ar_dining"),
						this.urls.getPath("ar_lifestyle"),
				  ]
				: [
						this.urls.getPath("en_shopping"),
						this.urls.getPath("en_travel"),
						this.urls.getPath("en_dining"),
						this.urls.getPath("en_lifestyle"),
				  ];

		for (const link of links) {
			const page = await this.drivers[lang].newPage();
			await this.drivers[lang].goTo(page, link);
			await sleep(1000);

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
