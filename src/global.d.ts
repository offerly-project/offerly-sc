import { IScrapper } from "./scrappers/scrapper";

declare module "express-serve-static-core" {
	interface Request {
		scrapper: IScrapper;
	}
}