import { Bank, SCRAPPERS } from "../constants";
import { IScrapper } from "./scrapper";

export const setupScrapper = async (bank: Bank): Promise<IScrapper> => {
	const scrapper = new SCRAPPERS[bank]();
	return scrapper;
};
