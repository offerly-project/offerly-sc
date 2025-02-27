import { IOffer } from "../global";
import { prepareStoredOffersToDelta } from "../utils";
import { ScrapeDriver } from "./driver";

export interface IDelta {
	delta_added: string[];
	delta_removed: string[];
}

export type Delta = {
	ar: IDelta;
	en: IDelta;
};

export interface IScrapper {
	drivers: Drivers;
	getOffersDelta(offers: Set<string>, lang: "ar" | "en"): Promise<IDelta>;
}

export type Drivers = {
	en: ScrapeDriver;
	ar: ScrapeDriver;
};

export type OffersPromptResponseFormat = {
	data: string[];
};

export abstract class BaseScrapper implements IScrapper {
	constructor(drivers: Drivers) {
		this.drivers = drivers;
	}
	drivers: Drivers;
	abstract getOffersDelta(
		offers: Set<string>,
		lang: "ar" | "en"
	): Promise<IDelta>;

	async getDelta(offers: IOffer[]): Promise<Delta> {
		const { ar, en } = prepareStoredOffersToDelta(offers);
		const [ar_delta, en_delta] = await Promise.all([
			this.getOffersDelta(ar, "ar"),
			this.getOffersDelta(en, "en"),
		]);

		return {
			ar: ar_delta,
			en: en_delta,
		};
	}
}
