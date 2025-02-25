import momentTz from "moment-timezone";
import "moment/locale/ar";
import { IOffer } from "../../global";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareStoredOffersToDelta,
} from "../../utils";
import { Delta, Drivers, IDelta, IScrapper } from "../scrapper";

export class SabScrapper implements IScrapper {
	tz = "Asia/Riyadh";
	urls = new URLS("https://www.sab.com", {
		en: "/en/personal/compare-credit-cards/credit-card-special-offers/all-offers",
		ar: "/ar/personal/compare-credit-cards/credit-card-special-offers/all-offers",
	});
	drivers: Drivers;
	constructor(drivers: Drivers) {
		this.drivers = drivers;
	}
	getArabicOffersDelta = async (offers: Set<string>): Promise<IDelta> => {
		const page = await this.drivers.ar.newPage();
		await this.drivers.ar.goTo(page, this.urls.getPath("ar")); // Corrected for Arabic page navigation

		const cardsContainerPath = ".sab-cardsListingTab-v3__cards > div"; // The selector for offers cards
		const cardsContainer = await page.$$(cardsContainerPath);
		const liveOffers = new Set<string>();

		for (const card of cardsContainer) {
			const expirationDateSelector = ".sab-cardsListingTab-v3__promotion-date";
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

			liveOffers.add(title);
		}

		const delta_added = getAddedDelta(offers, liveOffers);
		const delta_removed = getRemovedDelta(offers, liveOffers);

		return {
			delta_added,
			delta_removed,
		};
	};
	getEnglishOffersDelta = async (offers: Set<string>): Promise<IDelta> => {
		const page = await this.drivers.en.newPage();
		await this.drivers.en.goTo(page, this.urls.getPath("en"));
		const cardsContainerPath = ".sab-cardsListingTab-v3__cards > div";
		const cardsContainer = await page.$$(cardsContainerPath);
		const liveOffers = new Set<string>();

		for (const card of cardsContainer) {
			const expirationDateSelector = ".sab-cardsListingTab-v3__promotion-date";
			const titleSelector = ".sab-cardsListingTab-v3__cards-title";

			const titleNode = await card.$(titleSelector);
			const expirationDateNode = await card.$(expirationDateSelector);

			if (!titleNode) continue;

			const title = await titleNode.evaluate((el) => el.textContent);

			const expirationDate = await expirationDateNode?.evaluate(
				(el) => el.textContent
			);

			if (!title) continue;

			const currentDate = new Date();

			const expiryDate = expirationDate
				? momentTz.tz(expirationDate, "MMMM D, YYYY", this.tz).toDate()
				: undefined;

			if (expiryDate && currentDate > expiryDate) continue;

			liveOffers.add(title);
		}

		const delta_added = getAddedDelta(offers, liveOffers);
		const delta_removed = getRemovedDelta(offers, liveOffers);

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
