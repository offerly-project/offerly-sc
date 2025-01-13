import { NextFunction, Request, Response } from "express";

type Params = {
	bank: string;
};

type Query = {
	cards: string;
};

const deltaHandler = async (
	req: Request<Params, {}, {}, Query>,
	res: Response,
	next: NextFunction
) => {
	try {
		const scrapper = req.scrapper;
		const delta = scrapper.getDelta();

		res.json(delta);
	} catch (e) {
		console.error(e);
		res.status(500).json({ message: "Error scrapping data" });
	}
};

export const ScrapeController = {
	deltaHandler,
};
