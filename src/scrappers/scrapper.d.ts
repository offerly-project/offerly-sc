import { IOffer } from "../global";
import { URLS } from "../urls";

interface IDelta {
	delta_added: string[];
	delta_removed: string[];
}

type Delta = {
	ar: IDelta;
	en: IDelta;
};

export interface IScrapper {
	urls: URLS<any>;
	getArabicOffersDelta(offers: Set<string>): Promise<IDelta>;
	getEnglishOffersDelta(offers: Set<string>): Promise<IDelta>;
	getDelta(offers: IOffer[]): Promise<Delta>;
}
