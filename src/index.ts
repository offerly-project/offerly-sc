// (async function () {

// import { connectToDB } from "./db";
// connectToDB();
// 	const app = express();

// 	app.use(json());

// 	app.get("/delta/:bank", scrapperInjector, ScrapeController.deltaHandler);

// 	app.listen(env.PORT, () => {
// 		console.log(`Server is running on port ${env.PORT}`);
// 	});
// })();

import { setupScrapper } from "./scrappers/factory";
(async function () {
	const rajhi = await setupScrapper("alrajhi");

	// Delta Testing.
})();
