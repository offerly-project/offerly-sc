import { NextFunction, Request, Response } from "express";
import { Bank, BANKS } from "./constants";
import { repository } from "./repository";

type Params = {
	bank: Bank;
};

const scrapeHandler = async (
	req: Request<Params>,
	res: Response,
	next: NextFunction
) => {
	try {
		const scrapper = req.scrapper;
		if (!BANKS.includes(req.params.bank)) {
			res.status(400).json({ message: "Invalid bank" });
			return;
		}
		const offers = await repository.getBankOffers(req.params.bank);
		const delta = await scrapper.getDelta(offers);

		res.json(delta);
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: "Error scrapping data" });
	}
};

export const ScrapeController = {
	scrapeHandler,
};
