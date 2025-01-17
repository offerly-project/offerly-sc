import express, { json } from "express";
import morgan from "morgan";
import { env } from "./config";
import { ScrapeController } from "./controller";
import { connectToDB } from "./db";
import { authMiddleware, scrapperInjector } from "./middlewares";
(async function () {
	connectToDB();
	const app = express();

	app.use(json());

	app.use(morgan("dev"));

	app.get(
		"/delta/:bank",
		authMiddleware,
		scrapperInjector,
		ScrapeController.scrapeHandler
	);

	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
})();

(async function () {
	// Sandbox
})();
