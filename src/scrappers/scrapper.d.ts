import { IOffer } from "../global";
import { URLS } from "../urls";
import { ScrapeDriver } from "./driver";

interface IDelta {
	delta_added: string[];
	delta_removed: string[];
}

type Delta = {
	ar: IDelta;
	en: IDelta;
};

export interface IScrapper {
	tz: string;
	urls: URLS<any>;
	drivers: Drivers;
	getArabicOffersDelta(offers: Set<string>): Promise<IDelta>;
	getEnglishOffersDelta(offers: Set<string>): Promise<IDelta>;
	getDelta(offers: IOffer[]): Promise<Delta>;
}

type Drivers = {
	en: ScrapeDriver;
	ar: ScrapeDriver;
};
