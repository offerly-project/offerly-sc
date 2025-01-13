import { NextFunction, Request, Response } from "express";
import { setupScrapper } from "./scrappers/factory";
import { isBankSupported } from "./utils";

export const scrapperInjector = async (
	req: Request<{ bank: string }>,
	res: Response,
	next: NextFunction
) => {
	try {
		const { bank } = req.params;
		if (!bank) {
			throw new Error("Bank is required");
		}
		if (!isBankSupported(bank)) {
			throw new Error("Bank is not supported");
		}
		req.scrapper = await setupScrapper(bank);
		next();
	} catch (e) {
		console.error(e);
		res.status(400).json({ message: "Bank not supported" });
	}
};
