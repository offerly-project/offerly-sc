import jwt from "jsonwebtoken";
import { env } from "./config";
import { Bank, BANKS } from "./constants";
import { IOffer } from "./global";
import { ScrapeDriver } from "./scrappers/driver";
import { Drivers } from "./scrappers/scrapper";

export const isBankSupported = (bank: string): bank is Bank => {
	return BANKS.includes(bank as Bank);
};

export const sleep = (s: number) => {
	return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

export type UserRole = "admin" | "user" | "guest";
export type JwtUserPayload = {
	id: string;
	role: UserRole;
};

export const verifyToken = (token: string): Promise<JwtUserPayload> => {
	return new Promise((resolve, reject) => {
		jwt.verify(token, env.PRIVATE_KEY, (err, decoded) => {
			if (err) {
				reject(new Error("Invalid token"));
			}
			if (decoded) resolve(decoded as JwtUserPayload);
		});
	});
};

export const createDrivers = (): Drivers => {
	return {
		en: new ScrapeDriver(),
		ar: new ScrapeDriver(),
	};
};

export const cleanupDrivers = (drivers: Drivers) => () => {
	return Promise.all([drivers.en.cleanup(), drivers.ar.cleanup()]);
};

export const launchDrivers = async (drivers: Drivers) => {
	await Promise.all([drivers.en.launch(), drivers.ar.launch()]);
};

export const prepareStoredOffersToDelta = (offers: IOffer[]) => {
	const ar: Set<string> = new Set();
	const en: Set<string> = new Set();
	for (const offer of offers) {
		ar.add(offer.ar.trim());
		en.add(offer.en.trim());
	}
	return { ar, en };
};
