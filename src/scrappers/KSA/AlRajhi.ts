import { Page } from "puppeteer";
import { IOffer } from "../../global";
import { URLS } from "../../urls";
import { ScrapeDriver } from "../driver";
import { IDelta, IScrapper } from "../scrapper";

export class AlRajhiScrapper implements IScrapper {
	mainArabicUrl = "https://www.alrajhibank.com.sa/ar/Personal/Offers";

	mainEnglishUrl = "https://www.alrajhibank.com.sa/en/Personal/Offers";

	urls = new URLS("https://www.alrajhibank.com.sa", {
		en_main: "/en/Personal/Offers",
		ar_main: "/ar/Personal/Offers",
		category_ar_prefix: "/ar/Personal/Offers/",
		category_en_prefix: "",
	});

	async scrapeArabicOffers(): Promise<IOffer[]> {
		return [] as any;
	}
	async scrapeEnglishOffers(): Promise<IOffer[]> {
		const driver = new ScrapeDriver();
		await driver.launch();
		// Main Page
		const mainPage = await driver.newPage();
		await driver.goTo(mainPage, this.mainEnglishUrl);
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
			const page = await driver.newPage();
			await driver.goTo(
				page,
				this.urls.getPath("category_en_prefix") + hrefs[i]
			);
			pages.push(page);
		}

		return [];
	}

	getDelta = async (offers: IOffer[]): Promise<IDelta> => {
		await Promise.all([this.scrapeArabicOffers(), this.scrapeEnglishOffers()]);
		return {
			delta_added: offers.slice(0, 10).map((offer) => offer.en),
			delta_removed: offers.slice(12, 40).map((offer) => offer.en),
		};
	};
}
