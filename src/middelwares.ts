import { NextFunction, Request, Response } from "express";
import { verifyToken } from "./utils";

const _authorize = () => {
	return async (
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
};
