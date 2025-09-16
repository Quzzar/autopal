import { GEO_COORDS } from '../settings/general';
import { MAX_TRAVEL_DISTANCE, PREFERENCE_PROMPT } from '../settings/modeAiSelect';
import type { Meal } from '../types';
import { getDistance } from '../utils';

export async function findBestAiSelectMeal(_sessionToken: string, allMeals: Meal[]): Promise<Meal | null> {
	const onlyNearbyMeals = allMeals.filter(
		(m) =>
			getDistance(
				{
					x: m.coords.lat,
					y: m.coords.lng,
				},
				{
					x: GEO_COORDS.lat,
					y: GEO_COORDS.lng,
				}
			) <= MAX_TRAVEL_DISTANCE
	);

	const prompt = `
	
	I'm so hungry! Please select a meal for me to eat from the following options:

	${JSON.stringify(
		onlyNearbyMeals.map((m) => ({
			mealId: m.mealId,
			mealName: m.mealName,
			restaurantName: m.restaurantName,
			description: m.description,
			cuisine: m.cuisine,
			isHealthy: m.isHealthy,
			isVeggie: m.isVeggie,
		}))
	)}

	Here's what I like to eat:
	${PREFERENCE_PROMPT}

	NOTE: Don't respond with anything but the selected meal ID!
	No explanations, no additional text. Just the mealId in plain text.
	`.trim();

	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			model: 'gpt-5-nano',
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
		}),
	});

	const data = (await res.json()) as any;
	const text = data?.choices?.[0]?.message?.content ?? null;

	if (text) {
		const selectedMealId = text.trim();
		const selectedMeal = onlyNearbyMeals.find((m) => m.mealId === selectedMealId);

		if (selectedMeal) {
			return selectedMeal;
		} else {
			// Meal ID not found
			console.warn('Error! AI said:', selectedMealId);
			return null;
		}
	} else {
		// Failed response from AI
		console.warn('Error! Bad AI response:', data, res.status, res.statusText);
		return null;
	}
}
