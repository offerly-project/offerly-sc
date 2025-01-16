import express, { json } from "express";
import { env } from "./config";
import { ScrapeController } from "./controller";
import { connectToDB } from "./db";
import { scrapperInjector } from "./middlewares";
(async function () {
	connectToDB();
	const app = express();

	app.use(json());

	app.get("/delta/:bank", scrapperInjector, ScrapeController.scrapeHandler);

	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
})();

(async function () {
	// Sandbox
})();
