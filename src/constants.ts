import { AlRajhiScrapper } from "./scrappers/KSA/AlRajhi";
import { SabScrapper } from "./scrappers/KSA/Sab";
import { Drivers, IScrapper } from "./scrappers/scrapper";

export const BANKS = ["alrajhi", "sab"] as const;

export type Bank = (typeof BANKS)[number];

export const SCRAPPERS: Record<Bank, new (drivers: Drivers) => IScrapper> = {
	alrajhi: AlRajhiScrapper,
	sab: SabScrapper,
};

export const INACTIVITY_TIMEOUT = 1000 * 60 * 10;

export const DRIVER_RATE_LIMIT = 4;

export const SCRAPPERS_CAP = 5 * 2;
