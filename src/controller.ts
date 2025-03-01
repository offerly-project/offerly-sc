import { NextFunction, Request, Response } from "express";
import { cacheService } from "./cache";
import { Bank, BANKS } from "./constants";
import { repository } from "./repository";
import { ScrapeDriver } from "./scrappers/driver";
import { setupScrapper } from "./scrappers/factory";
import { Delta } from "./scrappers/scrappers";
import {
	cleanupDrivers,
	createDrivers,
	launchDrivers,
	markDeltaOffers,
} from "./utils";

type Params = {
	bank: Bank;
};

const deltaHandler = async (
	req: Request<Params>,
	res: Response,
	next: NextFunction
) => {
	if (!ScrapeDriver.canInstantiate()) {
		res
			.status(500)
			.json({ message: "Too many active scrappers, try again later." });
		return;
	}

	const offers = await repository.getBankOffers(req.params.bank);

	const cachedOffers = await cacheService.get<Delta>(
		`delta-${req.params.bank}`
	);

	if (cachedOffers) {
		const markedOffers: Delta = markDeltaOffers(offers, cachedOffers);
		res.json(markedOffers);
		return;
	}

	const drivers = createDrivers();
	await launchDrivers(drivers);
	try {
		res.on("error", cleanupDrivers(drivers));
		res.on("close", cleanupDrivers(drivers));
		res.on("end", cleanupDrivers(drivers));

		if (!BANKS.includes(req.params.bank)) {
			res.status(400).json({ message: "Invalid bank" });
			return;
		}
		const scrapper = setupScrapper(drivers, req.params.bank);

		const delta = await scrapper.getDelta(offers);

		await cacheService.set(
			`delta-${req.params.bank}`,
			JSON.stringify(delta),
			60 * 60 * 3
		);

		res.json(delta);
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: "Error scrapping data" });
	}
};

export const ScrapeController = {
	deltaHandler,
};
