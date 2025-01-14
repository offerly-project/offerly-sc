import { Db } from "mongodb";
import { Bank } from "./constants";
import { db } from "./db";
import { IOffer } from "./global";

export class Repository {
	private db: Db;
	constructor(db: Db) {
		this.db = db;
	}

	private _getBankOffersPipeline = (bank: Bank) => [
		{
			$match: {
				scrapper_id: bank,
			},
		},
		{
			$project: {
				cards: 1,
			},
		},
		{
			$lookup: {
				from: "offers",
				localField: "cards",
				foreignField: "applicable_cards",
				as: "offers",
			},
		},
		{
			$project: {
				_id: 0,
				offers: 1,
			},
		},
		{
			$unwind: "$offers",
		},
		{
			$replaceRoot: {
				newRoot: "$offers.title",
			},
		},
		{
			$project: {
				en: 1,
			},
		},
	];
	async getBankOffers(bank: Bank): Promise<IOffer[]> {
		return await this.db
			.collection("banks")
			.aggregate<IOffer>(this._getBankOffersPipeline(bank))
			.toArray();
	}
}

export const repository = new Repository(db);
