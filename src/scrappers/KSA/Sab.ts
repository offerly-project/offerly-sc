import momentTz from "moment-timezone";
import "moment/locale/ar";
import { sleep } from "openai/core";
import { IOffer } from "../../global";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	prepareStoredOffersToDelta,
} from "../../utils";
import { Delta, Drivers, IDelta, IScrapper } from "../scrapper";

export class SabScrapper implements IScrapper {
	tz = "Asia/Riyadh";
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
	drivers: Drivers;
	constructor(drivers: Drivers) {
		this.drivers = drivers;
	}
	getArabicOffersDelta = async (offers: Set<string>): Promise<IDelta> => {
		const liveOffers: string[] = [];
		const links = [
			this.urls.getPath("ar_shopping"),
			this.urls.getPath("ar_travel"),
			this.urls.getPath("ar_dining"),
			this.urls.getPath("ar_lifestyle"),
		];
		for (const link of links) {
			const page = await this.drivers.ar.newPage();
			await this.drivers.ar.goTo(page, link);
			await sleep(1000);

			const cardsContainerPath = ".sab-cardsListingTab-v3__cards > div"; // The selector for offers cards
			const cardsContainer = await page.$$(cardsContainerPath);

			for (const card of cardsContainer) {
				const expirationDateSelector =
					".sab-cardsListingTab-v3__promotion-date";
				const titleSelector = ".sab-cardsListingTab-v3__cards-title";

				const titleNode = await card.$(titleSelector);
				const expirationDateNode = await card.$(expirationDateSelector);

				if (!titleNode || !expirationDateNode) continue;

				const title = await titleNode.evaluate((el) => el.textContent);
				const expirationDate = await expirationDateNode.evaluate(
					(el) => el.textContent
				);

				if (!title || !expirationDate) continue;

				const currentDate = new Date();

				const expiryDate = momentTz
					.tz(expirationDate, "MMMM D, YYYY", this.tz)
					.toDate();

				if (expiryDate && currentDate > expiryDate) continue;

				liveOffers.push(title);
			}
		}

		const scrappedOffers = prepareScrappedOffersToDelta(liveOffers);

		const delta_added = getAddedDelta(offers, scrappedOffers);
		const delta_removed = getRemovedDelta(offers, scrappedOffers);

		return {
			delta_added,
			delta_removed,
		};
	};
	getEnglishOffersDelta = async (offers: Set<string>): Promise<IDelta> => {
		const liveOffers: string[] = [];
		const links = [
			this.urls.getPath("en_shopping"),
			this.urls.getPath("en_travel"),
			this.urls.getPath("en_dining"),
			this.urls.getPath("en_lifestyle"),
		];

		for (const link of links) {
			const page = await this.drivers.en.newPage();
			await this.drivers.en.goTo(page, link);
			await sleep(1000);
			const cardsContainerPath = ".sab-cardsListingTab-v3__cards > div"; // The selector for offers cards
			const cardsContainer = await page.$$(cardsContainerPath);

			for (const card of cardsContainer) {
				const expirationDateSelector =
					".sab-cardsListingTab-v3__promotion-date";
				const titleSelector = ".sab-cardsListingTab-v3__cards-title";

				const titleNode = await card.$(titleSelector);
				const expirationDateNode = await card.$(expirationDateSelector);

				if (!titleNode || !expirationDateNode) continue;

				const title = await titleNode.evaluate((el) => el.textContent);
				const expirationDate = await expirationDateNode.evaluate(
					(el) => el.textContent
				);

				if (!title || !expirationDate) continue;

				const currentDate = new Date();

				const expiryDate = momentTz
					.tz(expirationDate, "MMMM D, YYYY", this.tz)
					.toDate();

				if (currentDate > expiryDate) continue;

				liveOffers.push(title);
			}
		}

		const scrappedOffers = prepareScrappedOffersToDelta(liveOffers);

		const delta_added = getAddedDelta(offers, scrappedOffers);
		const delta_removed = getRemovedDelta(offers, scrappedOffers);

		return {
			delta_added,
			delta_removed,
		};
	};
	async getDelta(offers: IOffer[]): Promise<Delta> {
		const { ar, en } = prepareStoredOffersToDelta(offers);
		const [ar_delta, en_delta] = await Promise.all([
			this.getArabicOffersDelta(ar),
			this.getEnglishOffersDelta(en),
		]);

		return {
			ar: ar_delta,
			en: en_delta,
		};
	}
}
