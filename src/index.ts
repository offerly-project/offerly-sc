import cors from "cors";
import express, { json } from "express";
import morgan from "morgan";
import { env } from "./config";
import { ScrapeController } from "./controller";
import { connectToDB } from "./db";
import { authMiddleware } from "./middlewares";
import { repository } from "./repository";
import { SabScrapper } from "./scrappers/KSA/Sab";
import { createDrivers, launchDrivers } from "./utils";
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
				"https://admin.offerly.me",
			],
		})
	);

	app.get("/delta/:bank", authMiddleware, ScrapeController.deltaHandler);

	app.listen(env.PORT, () => {
		console.log(`Server is running on port ${env.PORT}`);
	});
})();

(async function () {
	const drivers = createDrivers();
	await launchDrivers(drivers);
	const scrapper = new SabScrapper(drivers);
	const offers = await repository.getBankOffers("sab");
	const delta = await scrapper.getDelta(offers);
	console.log(delta);
})();
