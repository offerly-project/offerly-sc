import { Bank, SCRAPPERS } from "../constants";
import { Drivers, IScrapper } from "./scrapper";

export const setupScrapper = (drivers: Drivers, bank: Bank): IScrapper => {
	const scrapper = new SCRAPPERS[bank](drivers);
	return scrapper;
};
