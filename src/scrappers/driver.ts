import Puppeteer, { Browser } from "puppeteer";

export class ScrapeDriver {
	private _driver!: Browser;

	launch = async () => {
		this._driver = await Puppeteer.launch({ headless: false });
	};
}
