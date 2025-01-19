import cors from "cors";
import express, { json } from "express";
import morgan from "morgan";
import { env } from "./config";
import { ScrapeController } from "./controller";
import { connectToDB } from "./db";
import { authMiddleware } from "./middlewares";
(async function () {
	connectToDB();
	const app = express();

	app.use(json());

	app.use(morgan("dev"));

	app.use(
		cors({
			origin: [
				"http://localhost:3000",
				"http://localhost:8080",
				"https://offerly.me",
			],
		})
	);

	app.get("/delta/:bank", authMiddleware, ScrapeController.scrapeHandler);

	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
})();

(async function () {
	// Sandbox
})();
