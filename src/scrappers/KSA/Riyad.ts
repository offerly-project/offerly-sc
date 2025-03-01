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
		mada_en: "/personal-banking/debit-card-promotions",
		mada_ar: "/ar/personal-banking/debit-card-promotions",
	});

	constructor(drivers: Drivers) {
		super(drivers);
	}

	// Helper function to fetch offers from any page, given a URL path
	private async fetchOffers(
		page: any,
		lang: "ar" | "en",
		urlPath: string
	): Promise<string[]> {
		const liveOffers: string[] = [];
		await this.drivers[lang].goTo(page, urlPath);
		const categoriesLinks = await page.$$(".childContainer a");
		const hrefs = new Set<string>();
		for (const categoryLink of categoriesLinks) {
			const href = await categoryLink.evaluate((el: HTMLElement) =>
				el.getAttribute("href")
			);
			if (href) hrefs.add(href);
		}
		for (const href of Array.from(hrefs)) {
			const categoryPage = await this.drivers[lang].newPage();
			await this.drivers[lang].goTo(categoryPage, this.urls.baseUrl + href);

			const titleNode = await categoryPage.$(
				".offers-section .component-heading"
			);
			if (!titleNode) continue;
			const title = await titleNode.evaluate((el) => el.textContent);
			if (!title) continue;
			liveOffers.push(title);
			await sleep(DRIVER_RATE_LIMIT);
		}
		console.log(liveOffers);

		await sleep(DRIVER_RATE_LIMIT);
		return liveOffers;
	}

	async getOffersDelta(
		dbOffers: Set<string>,
		lang: "ar" | "en"
	): Promise<IDelta> {
		const liveOffers: string[] = [];

		// Fetch category offers
		const page = await this.drivers[lang].newPage();
		const categoryOffers = await this.fetchOffers(
			page,
			lang,
			this.urls.getPath(`${lang}_categories`)
		);
		liveOffers.push(...categoryOffers);

		// Fetch Mada offers
		const madaPage = await this.drivers[lang].newPage();
		const madaOffers = await this.fetchOffers(
			madaPage,
			lang,
			this.urls.getPath(`mada_${lang}`)
		);
		liveOffers.push(...madaOffers);

		// Process the scrapped offers and calculate deltas
		const scrappedOffers = prepareScrappedOffersToDelta(liveOffers);
		const delta_added = getAddedDelta(dbOffers, scrappedOffers);
		const delta_removed = getRemovedDelta(dbOffers, scrappedOffers);

		return {
			delta_added,
			delta_removed,
		};
	}
}
