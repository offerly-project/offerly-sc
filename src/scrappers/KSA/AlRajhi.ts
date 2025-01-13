import { ScrapeDriver } from "../driver";
import { IDelta, IScrapper } from "../scrapper";

export class AlRajhiScrapper implements IScrapper {
	private _driver: ScrapeDriver;
	constructor(driver: ScrapeDriver) {
		this._driver = driver;
	}

	getDelta = async (): Promise<IDelta> => {
		return {
			delta_added: [],
			delta_removed: [],
		};
	};
}
