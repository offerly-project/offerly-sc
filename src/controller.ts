import { NextFunction, Request, Response } from "express";

type Params = {
	bank: string;
};

const deltaHandler = async (
	req: Request<Params>,
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
