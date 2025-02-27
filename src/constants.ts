import { AlRajhiScrapper } from "./scrappers/KSA/AlRajhi";
import { SabScrapper } from "./scrappers/KSA/Sab";
import { SnbScrapper } from "./scrappers/KSA/Snb";
import { BaseScrapper, Drivers } from "./scrappers/scrappers";

export const BANKS = ["alrajhi", "sab", "snb"] as const;

export type Bank = (typeof BANKS)[number];

export const SCRAPPERS: Record<Bank, new (drivers: Drivers) => BaseScrapper> = {
	alrajhi: AlRajhiScrapper,
	sab: SabScrapper,
	snb: SnbScrapper,
};

export const INACTIVITY_TIMEOUT = 1000 * 60 * 10;

export const DRIVER_RATE_LIMIT = 4;

export const SCRAPPERS_CAP = 5 * 2;
