import Puppeteer, { Browser, Page } from "puppeteer";
import { env } from "../config";
import { INACTIVITY_TIMEOUT, SCRAPPERS_CAP } from "../constants";

const DRIVER_CONFIG =
	env.NODE_ENV === "production"
		? {
				headless: true,
				defaultViewport: null,
				executablePath: "/usr/bin/google-chrome",
				args: ["--no-sandbox"],
		  }
		: { headless: true, defaultViewport: null };

export class ScrapeDriver {
	private _driver!: Browser;
	private inactivityTimer!: NodeJS.Timeout | null;
	private static _instancesNumber = 0;

	constructor() {
		ScrapeDriver._instancesNumber++;
		this.inactivityTimer = null;
	}

	static canInstantiate = () => {
		return ScrapeDriver._instancesNumber < SCRAPPERS_CAP;
	};

	private resetInactivityTimer = () => {
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
		}
		this.inactivityTimer = setTimeout(async () => {
			console.log("Cleaning up due to inactivity...");
			await this.cleanup();
		}, INACTIVITY_TIMEOUT);
	};

	launch = async () => {
		this._driver = await Puppeteer.launch(DRIVER_CONFIG);
		this.resetInactivityTimer();
	};

	cleanup = async () => {
		if (this._driver) {
			await this._driver.close();
			this._driver = null as any;
			ScrapeDriver._instancesNumber--;
			console.log("Browser instance closed.");
		}
		if (this.inactivityTimer) {
			clearTimeout(this.inactivityTimer);
			this.inactivityTimer = null;
		}
	};

	newPage = async () => {
		this.resetInactivityTimer();
		return await this._driver.newPage();
	};

	goTo = async (page: Page, url: string) => {
		this.resetInactivityTimer();
		await page.goto(url);
	};
}
