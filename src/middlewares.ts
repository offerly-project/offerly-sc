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

import { verifyToken } from "./utils";

export const authMiddleware = async (
	req: Request<any, any, any, any>,
	res: Response,
	next: NextFunction
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader) {
			res.status(401).send("Authorization header is missing");
			return;
		}

		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			res.status(401).send("Token is missing");
			return;
		}

		const data = await verifyToken(token!);

		if (data.role !== "admin") {
			res.status(401).send("You are not authorized to access this resource");
			return;
		}

		next();
		return;
	} catch (e) {
		next(e);
	}
};
