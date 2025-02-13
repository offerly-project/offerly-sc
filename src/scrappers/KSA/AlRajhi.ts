import { Page } from "puppeteer";
import { DRIVER_RATE_LIMIT } from "../../constants";
import { IOffer } from "../../global";
import { URLS } from "../../urls";
import {
	getAddedDelta,
	getRemovedDelta,
	prepareScrappedOffersToDelta,
	prepareStoredOffersToDelta,
	sleep,
} from "../../utils";
import { Delta, Drivers, IDelta, IScrapper } from "../scrapper";

const WAIT_TIMEOUT = 1000;

export class AlRajhiScrapper implements IScrapper {
	urls = new URLS("https://www.alrajhibank.com.sa", {
		en_main: "/en/Personal/Offers",
		ar_main: "/ar/Personal/Offers",
	});
	drivers: Drivers = {} as Drivers;

	constructor(drivers: Drivers) {
		this.drivers.en = drivers.en;
		this.drivers.ar = drivers.ar;
	}
	tz = "Asia/Riyadh";

	async getPageOffers(page: Page): Promise<string[]> {
		const offers: string[] = [];
		const offerNodes = await page.$$(".card-title");
		for await (const offerNode of offerNodes) {
			await offerNode.hover(); // Hover over each card title
			const title = await offerNode.evaluate((el) => el.textContent);
			if (title) {
				offers.push(title.trim());
			}
		}
		return offers;
	}

	async getArabicOffersDelta(dbOffers: Set<string>): Promise<IDelta> {
		const mainPage = await this.drivers.ar.newPage();
		await this.drivers.ar.goTo(mainPage, this.urls.getPath("ar_main"));

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
			const page = await this.drivers.ar.newPage();
			await this.drivers.ar.goTo(page, this.urls.baseUrl + hrefs[i]);

			try {
				while (
					await page.waitForSelector(".load-more .button-alrajhi-primary", {
						timeout: WAIT_TIMEOUT,
					})
				) {
					await page.click(".load-more .button-alrajhi-primary");
					await sleep(1);
				}
			} catch (e) {}
			try {
				const offerNodes = await page.$$(".card-title");
				for await (const offerNode of offerNodes) {
					const title = await offerNode.evaluate((el) => el.textContent);
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

	async getEnglishOffersDelta(dbOffers: Set<string>): Promise<IDelta> {
		const mainPage = await this.drivers.en.newPage();
		await this.drivers.en.goTo(mainPage, this.urls.getPath("en_main"));

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
			const page = await this.drivers.en.newPage();
			await this.drivers.en.goTo(page, this.urls.baseUrl + hrefs[i]);

			try {
				while (
					await page.waitForSelector(".load-more .button-alrajhi-primary", {
						timeout: WAIT_TIMEOUT,
					})
				) {
					await page.click(".load-more .button-alrajhi-primary");
					await sleep(1);
				}
			} catch (e) {}
			try {
				const offerNodes = await page.$$(".card-title");
				for await (const offerNode of offerNodes) {
					const title = await offerNode.evaluate((el) => el.textContent);
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

	getDelta = async (offers: IOffer[]): Promise<Delta> => {
		const { ar, en } = prepareStoredOffersToDelta(offers);
		const [ar_delta, en_delta] = await Promise.all([
			this.getArabicOffersDelta(ar),
			this.getEnglishOffersDelta(en),
		]);

		return {
			ar: ar_delta,
			en: en_delta,
		};
	};
}
