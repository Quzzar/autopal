export interface Meal {
	restaurantName: string;
	scheduleId: string;
	mealName: string;
	mealId: string;
	mealPortion: number;
	inventory: number;
	description: string;
	cuisine: string;
	isHealthy: boolean;
	isVeggie: boolean;
	coords: { lng: number; lat: number };
}
