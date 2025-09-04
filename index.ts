import { CITY, ENABLED, MEALS, PICKUP_TIME, RANDOM_SELECT_PERCENTAGE } from './src/settings';
import { getRandomNumber, getDate, sleep, sendNotification } from './src/utils';

async function login() {
	const res = await fetch('https://secure.mealpal.com/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			username: process.env.MEALPAL_USERNAME ?? '',
			password: process.env.MEALPAL_PASSWORD ?? '',
		}),
	});
	if (!res.ok) {
		throw new Error(`Login failed: ${res.statusText}`);
	}
	const data = await res.json();
	return data as {
		id: string;
		email: string;
		status: number;
		firstName: string;
		lastName: string;
		sessionToken: string;
		city: {
			id: string;
			name: string;
			city_code: string;
			countryCode: string;
			__type: string;
			className: string;
			objectId: string;
		};
	};
}

async function getMenu(sessionToken: string) {
	const res = await fetch(`https://secure.mealpal.com/api/v6/cities/${CITY}/dates/${getDate()}/product_offerings/lunch/spending_strategies/credits/menu`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `_mealpal_session=${sessionToken}`,
		},
	});
	if (!res.ok) {
		throw new Error(`Menu fetch failed: ${res.statusText}, ${res.url}`);
	}
	const data = await res.json();
	return data as {
		city: {
			coordinates: { longitude: string; latitude: string };
			id: string;
			name: string;
			state: string;
			time_zone_name: string;
			timezone_offset_hours: number;
		};
		date: string;
		extended_kitchen_start_time: string;
		generated_at: string;
		restaurants: {
			address: string;
			coordinates: { longitude: string; latitude: string };
			full_address: string;
			id: string;
			mp_discount_percentage: number;
			name: string;
			neighborhood: {
				id: string;
				name: string;
			};
			priority: number;
			kitchen_times: {
				before: string;
				close: string;
				open: string;
			}[];
			schedules: {
				classic_kitchen_savings_meal_credit_price: number;
				extended_kitchen_meal_credit_price: number;
				id: string;
				is_featured: boolean;
				meal_credit_price: number;
				mp_discount_percentage: number;
				packaging: unknown;
				priority: number;
				tier: string;
				meal: {
					cuisine: string;
					description: string;
					healthy: boolean;
					healthy_subtext: string | null;
					id: string;
					image: string;
					meal_group: string;
					name: string;
					portion: number;
					portion_size_key: string;
					retail_price_display_string: string;
					veg: boolean;
				};
			}[];
		}[];
	};
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

async function getInventories(sessionToken: string) {
	const res = await fetch(`https://secure.mealpal.com/api/v1/cities/${CITY}/dates/${getDate()}/product_offerings/lunch/spending_strategies/credits/menu_inventories`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `_mealpal_session=${sessionToken}`,
		},
	});
	if (!res.ok) {
		throw new Error(`Inventory fetch failed: ${res.statusText}`);
	}
	const data = await res.json();
	return data as {
		amount: number;
		date: string;
		id: string;
		mpn_amount: number;
	}[];
}

async function reserveMeal(sessionToken: string, scheduleId: string) {
	const res = await fetch('https://secure.mealpal.com/api/v1/pickup_orders', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `_mealpal_session=${sessionToken}`,
		},
		body: JSON.stringify({
			schedules: [
				{
					pickup_time: PICKUP_TIME,
					quantity: 1,
					schedule_id: scheduleId,
				},
			],
			source_attributes: {
				location: 'pickup_kitchen',
				platform: 'web',
			},
		}),
	});
	if (!res.ok) {
		throw new Error(`Reservation failed: ${res.statusText}`);
	}
	return res.status;
}

async function findAvailableCoworkerMeals(
	sessionToken: string,
	allMeals: {
		restaurantName: string;
		scheduleId: string;
		mealName: string;
		mealId: string;
		mealPortion: number;
		inventory: number;
	}[]
) {
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

async function getUpcomingOrders(sessionToken: string) {
	const res = await fetch(`https://secure.mealpal.com/api/v6/upcoming_orders`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `_mealpal_session=${sessionToken}`,
		},
	});
	if (!res.ok) {
		throw new Error(`Upcoming orders fetch failed: ${res.statusText}`);
	}
	const data = await res.json();
	return data as {
		id: string;
		date: string; // eg. "2025-09-05"
		pickup_link: string;
		// and other data
	}[];
}

/**
 * Trigger function to log in and reserve a meal.
 */
(async function trigger() {
	if (!ENABLED) {
		console.log('<🤖> Autopal is disabled in settings. Exiting...');
		return false;
	}

	console.log('<🤖> Running Autopal ...🥙...🌯...🍱...🍔...');
	const loginDetails = await login();
	const token = loginDetails.sessionToken.split(':')[1] ?? '';

	await sleep(getRandomNumber(500, 3000));

	const menu = await getMenu(token);
	const invs = await getInventories(token);

	const allMeals: {
		restaurantName: string;
		scheduleId: string;
		mealName: string;
		mealId: string;
		mealPortion: number;
		inventory: number;
	}[] = [];
	for (const restaurant of menu.restaurants) {
		for (const schedule of restaurant.schedules) {
			const inventory = invs.find((inv) => inv.id === schedule.id);
			allMeals.push({
				restaurantName: restaurant.name,
				scheduleId: schedule.id,
				mealName: schedule.meal.name,
				mealId: schedule.meal.id,
				mealPortion: schedule.meal.portion,
				inventory: inventory?.amount ?? -999,
			});
		}
	}

	await sleep(getRandomNumber(500, 3000));

	// Find best meal
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

			const foundMeal = await findAvailableCoworkerMeals(token, allMeals);
			if (foundMeal) {
				bestMeal = {
					foundMeal,
					settingsRecord: null,
				};
			}
		}
	}

	if (bestMeal) {
		if (bestMeal.foundMeal.inventory <= 0) {
			console.log(`<🤖> Not enough inventory for ${bestMeal.foundMeal.mealName} at ${bestMeal.foundMeal.restaurantName}. Attempting to reserve anyway...`);
		}
		const status = await reserveMeal(token, bestMeal.foundMeal.scheduleId);
		if (status === 201) {
			console.log(
				`<🤖> Meal reserved successfully!\n\nFor: ${loginDetails.firstName} ${loginDetails.lastName}\nRestaurant: ${bestMeal.foundMeal.restaurantName}\nMeal: ${bestMeal.foundMeal.mealName}\nPickup Time: ${PICKUP_TIME}`
			);

			// Get pickup link from upcoming order
			const orders = await getUpcomingOrders(token);
			const nextOrder = orders.find((o) => o.date === getDate());

			await sendNotification(`
I got you food! 🌯🥙🍣
You're getting ${bestMeal.foundMeal.mealName} from ${bestMeal.foundMeal.restaurantName}.
Pickup at ${PICKUP_TIME}.

${nextOrder?.pickup_link.split('www.')[1] ?? ''}

Enjoy! 😋
`);
			return true;
		} else {
			console.log(`<🤖> Failed to reserve meal. Status code: ${status}.`);
			await sendNotification(`
No meal today 💀
I failed to reserve meal. Status code: ${status}.
`);
			return false;
		}
	} else {
		console.log('<🤖> No meal found matching the criteria. Please check your settings.');
		await sendNotification(`
No meal today 😭
I found no meals matching your criteria. Please check your settings.
`);
		return false;
	}
})();
