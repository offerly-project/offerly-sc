import { Bank, SCRAPPERS } from "../constants";
import { BaseScrapper, Drivers } from "./scrappers";

export const setupScrapper = (drivers: Drivers, bank: Bank): BaseScrapper => {
	const scrapper = new SCRAPPERS[bank](drivers);
	return scrapper;
};
