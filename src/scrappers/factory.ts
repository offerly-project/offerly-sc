import { Bank, SCRAPPERS } from "../constants";
import { ScrapeDriver } from "./driver";
import { IScrapper } from "./scrapper";

export const setupScrapper = async (bank: Bank): Promise<IScrapper> => {
	const driver = new ScrapeDriver();
	await driver.launch();
	const scrapper = new SCRAPPERS[bank](driver);
	return scrapper;
};
