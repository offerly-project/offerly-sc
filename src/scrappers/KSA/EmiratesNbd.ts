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

export class EmiratesNbdScrapper extends BaseScrapper {
	urls = new URLS("https://www.emiratesnbd.com.sa", {
		categories_en: "/en/deals",
		categories_ar: "/ar/deals",
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
		const links = await page.$$(".categories-blocks a");

		const processedLinks = new Set<string>();

		for (const link of links) {
			try {
				const href = await link.evaluate((el) => el.getAttribute("href"));
				let fullLink = this.urls.baseUrl + href;
				if (href && href.startsWith("https://")) {
					continue;
				}
				if (processedLinks.has(fullLink)) continue;

				processedLinks.add(fullLink);
				const page = await this.drivers[lang].newPage();
				this.drivers[lang].allowLocation(page);
				await this.drivers[lang].goTo(page, fullLink);
				await triggerAllLoadMore(page, ".load-more-button > a");
				await page.waitForSelector(".deals-listing .content h3", {
					timeout: 5000,
				});
				const titleBlockSelector = ".deals-listing .content h3"; // The selector for offers cards
				const titlesNodes = await page.$$(titleBlockSelector);

				for (const titleNode of titlesNodes) {
					const title = await titleNode.evaluate((el) => el.textContent);

					if (!title) continue;

					liveOffers.push(title);
				}
				await sleep(DRIVER_RATE_LIMIT);
			} catch (e) {
				console.log(e);
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
