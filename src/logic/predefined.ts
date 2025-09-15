import { MEALS, RANDOM_SELECT_PERCENTAGE } from '../settings/modePredefined';
import type { Meal } from '../types';
import { getDate, getRandomNumber } from '../utils';

export async function findBestPredefinedMeal(sessionToken: string, allMeals: Meal[]): Promise<Meal | null> {
	const SETTINGS_RECORDS = MEALS.sort((a, b) => a.priority - b.priority);

	let bestMeal: {
		foundMeal: (typeof allMeals)[0];
		settingsRecord: (typeof MEALS)[0] | null;
	} | null = null;
	for (const M of SETTINGS_RECORDS) {
		const meal = allMeals.find((m) => {
			if (M.mealName && M.restaurantName) {
				return m.mealName.match(M.mealName) && m.restaurantName.match(M.restaurantName);
			}
			if (M.restaurantName) {
				return m.restaurantName.match(M.restaurantName);
			}
			if (M.mealName) {
				return m.mealName.match(M.mealName);
			}
			return false;
		});
		if (meal) {
			bestMeal = {
				foundMeal: meal,
				settingsRecord: M,
			};
			break;
		}
	}

	// Randomly select a meal

	const bestPriority = SETTINGS_RECORDS[0]?.priority;
	const worstPriority = SETTINGS_RECORDS[SETTINGS_RECORDS.length - 1]?.priority;
	const midPriority = Math.floor(((bestPriority ?? 0) + (worstPriority ?? 0)) / 2);

	if (!bestMeal || (bestMeal.settingsRecord && bestMeal.settingsRecord.priority > midPriority) || true) {
		if (RANDOM_SELECT_PERCENTAGE >= getRandomNumber(0, 100)) {
			console.log('<🤖> Randomly selecting a meal instead of the best match...');

			const foundMeal = await findAvailableCoworkerMeals(sessionToken, allMeals);
			if (foundMeal) {
				bestMeal = {
					foundMeal,
					settingsRecord: null,
				};
			}
		}
	}

	return bestMeal?.foundMeal ?? null;
}

async function findAvailableCoworkerMeals(sessionToken: string, allMeals: Meal[]) {
	const mealsData = await getCoworkerMeals(sessionToken, -7);
	const meals = mealsData.coworker_reservations.filter((r) => r.reservation).sort(() => Math.random() - 0.5);

	for (const meal of meals) {
		const foundMeal = allMeals.find((m) => m.mealId === meal.reservation?.meal.id);
		if (foundMeal) {
			return foundMeal;
		}
	}

	return null;
}

async function getCoworkerMeals(sessionToken: string, dayOffset: number) {
	const res = await fetch(`https://secure.mealpal.com/api/v3/dates/${getDate(dayOffset)}/workspace_menu`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `_mealpal_session=${sessionToken}`,
		},
	});
	if (!res.ok) {
		throw new Error(`Workspace menu fetch failed: ${res.statusText}, ${res.url}`);
	}
	const data = await res.json();
	return data as {
		coworker_reservations: {
			coworker: {
				is_current_user: boolean;
				id: string;
				name: string;
				full_name: string;
				avatar: string;
				floor: string;
				company_address_id: string;
			};
			reservation: {
				id: string;
				pickup_time: string;
				pickup_method: string;
				for_delivery: boolean;
				pickup_intent_owner: null;
				is_mealpal_now: boolean;
				schedule: {
					id: string;
					amount: number;
					mpn_amount: number;
					meal_credit_price: number;
				};
				meal: {
					id: string;
					name: string;
					description: string;
					image: string;
					meal_group: string;
					ingredients: string;
					cuisine: string;
					vegetarian: boolean;
					healthy: boolean;
					healthy_subtext: string;
					portion: string;
					retail_price_display_string: string;
				};
				restaurant: {
					id: string;
					name: string;
					address: string;
				};
			} | null;
		}[];
	};
}
