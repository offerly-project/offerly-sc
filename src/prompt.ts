import OpenAI from "openai";
import { env } from "./config";
import { IDelta } from "./scrappers/scrapper";

export const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY,
});

export class AIPrompt {
	private static generateDeltaPrompt(
		dbOffers: Set<string>,
		scrappedOffers: Set<string>
	): string {
		return `Compare the following offers:\n\n
    Scrapped Offers: ${Array.from(scrappedOffers).join("\n")}\n\n
    Stored Offers: ${Array.from(dbOffers).join("\n")}\n\n
    Find the delta where:\n
    - "delta_added" includes offers in scrapped but not stored.\n
    - "delta_removed" includes offers in stored but not scrapped.\n
    - "delta_renamed" includes renamed offers (ignore unchanged names).\n\n
    Respond in **valid JSON** (plain JSON, no prefix):\n\n
    {
        "delta_added": [...],
        "delta_removed": [...],
        "delta_renamed": [...{ "from": "old_name", "to": "new_name" }]
    }`;
	}

	static async getDelta(
		dbOffers: Set<string>,
		scrappedOffers: Set<string>
	): Promise<IDelta> {
		try {
			const completion = await openai.chat.completions.create({
				model: "gpt-4o-mini",
				store: true,
				messages: [
					{
						role: "user",
						content: this.generateDeltaPrompt(dbOffers, scrappedOffers),
					},
				],
			});

			const aiResponse = completion.choices[0]?.message.content;

			if (!aiResponse) {
				console.warn("AI returned an empty response.");
				return {
					delta_added: [],
					delta_removed: [],
					delta_renamed: [],
				};
			}

			// Ensure response is valid JSON
			const parsedResponse = JSON.parse(aiResponse);
			if (
				!parsedResponse ||
				!Array.isArray(parsedResponse.delta_added) ||
				!Array.isArray(parsedResponse.delta_removed) ||
				!Array.isArray(parsedResponse.delta_renamed)
			) {
				console.warn(
					"AI response is not in the expected format:",
					parsedResponse
				);
				return {
					delta_added: [],
					delta_removed: [],
					delta_renamed: [],
				};
			}

			return parsedResponse;
		} catch (error) {
			console.error("Error fetching AI response:", error);
			return {
				delta_added: [],
				delta_removed: [],
				delta_renamed: [],
			};
		}
	}
}
