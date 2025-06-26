export const CITY = `00000000-1000-4000-9845-9344bdb9408c`; // NYC
//
export const PICKUP_TIME = '12:15PM-12:30PM';
//
export const MEALS: {
	restaurantName?: RegExp;
	mealName?: RegExp;
	priority: number;
}[] = [
	{
		mealName: /^.*?Miso Glazed Salmon.*?/i,
		restaurantName: /^.*?sweetgreen - NoMad.*?/i,
		priority: 1,
	},
	{
		restaurantName: /^.*?Poke Bowl - 5th Ave.*?/i,
		priority: 2,
	},
	{
		restaurantName: /^.*?sweetgreen - NoMad.*?/i,
		priority: 3,
	},
];
