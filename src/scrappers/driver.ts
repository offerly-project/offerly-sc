import Puppeteer, { Browser, Page } from "puppeteer";
import { env } from "../config";
import { SCRAPPERS_CAP } from "../constants";

const DRIVER_CONFIG =
	env.NODE_ENV === "production"
		? {
				headless: true,
				defaultViewport: null,
				executablePath: "/usr/bin/google-chrome",
				args: ["--no-sandbox"],
		  }
		: { headless: false, defaultViewport: null };

export class ScrapeDriver {
	private _driver!: Browser;

	private static _instancesNumber = 0;

	constructor() {
		ScrapeDriver._instancesNumber++;
	}

	static canInstantiate = () => {
		return ScrapeDriver._instancesNumber < SCRAPPERS_CAP;
	};

	allowLocation = async (page: Page) => {
		await page.evaluateOnNewDocument(function () {
			navigator.geolocation.getCurrentPosition = function (cb) {
				setTimeout(() => {
					cb({
						coords: {
							accuracy: 0,
							altitude: null,
							altitudeAccuracy: null,
							heading: null,
							latitude: 0,
							longitude: 0,
							speed: null,
							toJSON: () => {},
						},
						timestamp: Date.now(),
						toJSON: () => {},
					});
				}, 1000);
			};
		});
	};

	launch = async () => {
		this._driver = await Puppeteer.launch(DRIVER_CONFIG);
	};

	cleanup = async () => {
		if (this._driver) {
			await this._driver.close();
			this._driver = null as any;
			ScrapeDriver._instancesNumber--;
			console.log("Browser instance closed.");
		}
	};

	newPage = async () => {
		return await this._driver.newPage();
	};

	goTo = async (page: Page, url: string) => {
		await page.goto(url);
	};
}
