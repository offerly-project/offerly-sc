import { AlRajhiScrapper } from "./scrappers/KSA/AlRajhi";
import { AnbScrapper } from "./scrappers/KSA/Anb";
import { BsfScrapper } from "./scrappers/KSA/Bsf";
import { EmiratesNbdScrapper } from "./scrappers/KSA/EmiratesNbd";
import { RiyadScrapper } from "./scrappers/KSA/Riyad";
import { SabScrapper } from "./scrappers/KSA/Sab";
import { SnbScrapper } from "./scrappers/KSA/Snb";
import { BaseScrapper, Drivers } from "./scrappers/scrappers";

export const BANKS = [
	"alrajhi",
	"sab",
	"snb",
	"nbd",
	"riyad",
	"bsf",
	"anb",
] as const;

export type Bank = (typeof BANKS)[number];

export const SCRAPPERS: Record<Bank, new (drivers: Drivers) => BaseScrapper> = {
	alrajhi: AlRajhiScrapper,
	sab: SabScrapper,
	snb: SnbScrapper,
	nbd: EmiratesNbdScrapper,
	riyad: RiyadScrapper,
	bsf: BsfScrapper,
	anb: AnbScrapper,
};

export const INACTIVITY_TIMEOUT = 1000 * 60 * 10;

export const DRIVER_RATE_LIMIT = 2;

export const SCRAPPERS_CAP = 5 * 2;
