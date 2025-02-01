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
			$lookup: {
				from: "offers",
				localField: "_id",
				foreignField: "bankId",
				as: "offers",
			},
		},
		{
			$project: {
				offers: 1,
			},
		},
		{
			$unwind: "$offers",
		},
		{
			$match: {
				"offers.status": "enabled",
			},
		},
		{
			$replaceRoot: {
				newRoot: "$offers.title",
			},
		},
		{
			$project: {
				en: 1,
				ar: 1,
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
