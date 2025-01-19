import { Page } from "puppeteer";
import { DRIVER_RATE_LIMIT } from "../../constants";
import { IOffer } from "../../global";
import { URLS } from "../../urls";
import { sleep } from "../../utils";
import { Delta, Drivers, IDelta, IScrapper } from "../scrapper";

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

	async getPageOffers(page: Page): Promise<string[]> {
		const offers: string[] = [];
		const offerNodes = await page.$$(".card-title");
		for await (const offerNode of offerNodes) {
			const title = await offerNode.evaluate((el) => el.textContent);
			if (title) offers.push(title.trim());
		}
		return offers;
	}

	async getArabicOffersDelta(dbOffers: Set<string>): Promise<IDelta> {
		// Main Page
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
				if (href) hrefs.push(href);
			}
		}

		const pages: Page[] = [];
		for (let i = 0; i < hrefs.length; i++) {
			const page = await this.drivers.ar.newPage();
			await this.drivers.ar.goTo(page, this.urls.baseUrl + hrefs[i]);
			pages.push(page);
			await sleep(DRIVER_RATE_LIMIT);
		}

		const liveOffers = new Set<string>();
		for (const page of pages) {
			while (await page.$(".btn-alrajhi-primary")) {
				await page.click(".btn-alrajhi-primary");
				await page.waitForSelector(".btn-alrajhi-primary");
			}
			const offerNodes = await page.$$(".card-title");
			for await (const offerNode of offerNodes) {
				const title = await offerNode.evaluate((el) => el.textContent);
				if (title) {
					liveOffers.add(title.trim());
				}
			}
		}
		const delta_added = [...liveOffers].filter((x) => !dbOffers.has(x));
		const delta_removed = [...dbOffers].filter((x) => !liveOffers.has(x));

		return {
			delta_added,
			delta_removed,
		};
	}
	async getEnglishOffersDelta(dbOffers: Set<string>): Promise<IDelta> {
		// Main Page
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
				if (href) hrefs.push(href);
			}
		}

		const pages: Page[] = [];
		for (let i = 0; i < hrefs.length; i++) {
			const page = await this.drivers.en.newPage();
			await this.drivers.en.goTo(page, this.urls.baseUrl + hrefs[i]);
			pages.push(page);
			await sleep(DRIVER_RATE_LIMIT);
		}

		const liveOffers = new Set<string>();
		for (const page of pages) {
			while (await page.$(".btn-alrajhi-primary")) {
				await page.click(".btn-alrajhi-primary");
				await page.waitForSelector(".btn-alrajhi-primary");
			}
			const offerNodes = await page.$$(".card-title");
			for await (const offerNode of offerNodes) {
				const title = await offerNode.evaluate((el) => el.textContent);
				if (title) {
					liveOffers.add(title.trim());
				}
			}
		}
		const delta_added = [...liveOffers].filter((x) => !dbOffers.has(x));
		const delta_removed = [...dbOffers].filter((x) => !liveOffers.has(x));

		return {
			delta_added,
			delta_removed,
		};
	}

	getDelta = async (offers: IOffer[]): Promise<Delta> => {
		const [ar_delta, en_delta] = await Promise.all([
			this.getArabicOffersDelta(new Set(offers.map((offer) => offer.ar))),
			this.getEnglishOffersDelta(new Set(offers.map((offer) => offer.en))),
		]);

		return {
			ar: ar_delta,
			en: en_delta,
		};
	};
}
