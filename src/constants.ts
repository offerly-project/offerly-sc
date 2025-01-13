import { ScrapeDriver } from "./scrappers/driver";
import { AlRajhiScrapper } from "./scrappers/KSA/AlRajhi";
import { IScrapper } from "./scrappers/scrapper";

export const BANKS = ["alrajhi"] as const;

export type Bank = (typeof BANKS)[number];

export const SCRAPPERS: Record<Bank, new (driver: ScrapeDriver) => IScrapper> =
	{
		alrajhi: AlRajhiScrapper,
	};