// (async function () {

// import { connectToDB } from "./db";
// connectToDB();
// 	const app = express();

// 	app.use(json());

// app.get("/delta/:bank", scrapperInjector, ScrapeController.deltaHandler);

// 	app.listen(env.PORT, () => {
// 		console.log(`Server is running on port ${env.PORT}`);
// 	});
// })();

import { repository } from "./repository";
import { setupScrapper } from "./scrappers/factory";
(async function () {
	const rajhi = await setupScrapper("alrajhi");
	const offers = await repository.getBankOffers("alrajhi");
	const delta = await rajhi.getDelta(offers);

	// Delta Testing.
})();
