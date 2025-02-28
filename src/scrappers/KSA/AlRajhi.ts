import { DRIVER_RATE_LIMIT } from "../../constants";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	sleep,
	triggerAllLoadMore,
} from "../../utils";
import { BaseScrapper, Drivers, IDelta } from "../scrappers";

const WAIT_TIMEOUT = 1000;

export class AlRajhiScrapper extends BaseScrapper {
	urls = new URLS("https://www.alrajhibank.com.sa", {
		categories_en: "/en/Personal/Offers",
		categories_ar: "/ar/Personal/Offers",
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
			this.urls.getPath(`categories_${lang}`)
		);

		const categoriesContainer = await mainPage.$$(
			"::-p-xpath(/html/body/div[2]/main/section/div/div/div/div/div/div)"
		);

		const hrefs: string[] = [];
		for await (const category of categoriesContainer) {
			const node = await category.$$("div:nth-child(2) > div > a");
			for await (const n of node) {
				const href = await n.evaluate((el) => el.getAttribute("href"));
				if (href) {
					hrefs.push(href);
				}
			}
		}

		const liveOffers: string[] = [];
		for (let i = 0; i < hrefs.length; i++) {
			const page = await this.drivers[lang].newPage();
			await this.drivers[lang].goTo(page, this.urls.baseUrl + hrefs[i]);

			await triggerAllLoadMore(page, ".btn-load-more");

			try {
				const offerNodes = await page.$$(".card-body");
				for await (const offerNode of offerNodes) {
					const titleNode = await offerNode.$(".card-title");

					if (!titleNode) continue;
					const title = await titleNode.evaluate((el) => el.textContent);

					if (title) {
						liveOffers.push(title.trim());
					}
				}
			} catch (e) {}
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
