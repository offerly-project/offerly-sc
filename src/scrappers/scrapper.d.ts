import { IOffer } from "../global";
import { URLS } from "../urls";

interface IDelta {
	delta_added: string[];
	delta_removed: string[];
}

export interface IScrapper {
	urls: URLS;
	scrapeArabicOffers(): Promise<IOffer[]>;
	scrapeEnglishOffers(): Promise<IOffer[]>;
	getDelta(offers: IOffer[]): Promise<IDelta>;
}
