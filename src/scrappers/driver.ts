import Puppeteer, { Browser, Page } from "puppeteer";

export class ScrapeDriver {
	private _driver!: Browser;
	private pageNo = 1;

	launch = async () => {
		this._driver = await Puppeteer.launch({
			headless: true,
			defaultViewport: null,
		});
	};

	close = async () => {
		await this._driver.close();
	};

	newPage = async () => {
		if (this.pageNo > 1) {
			return await this._driver.newPage();
		} else {
			const pages = await this._driver.pages();
			this.pageNo++;
			return pages[0];
		}
	};

	goTo = async (page: Page, url: string) => {
		await page.goto(url);
	};
}
