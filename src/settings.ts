export const CITY = `00000000-1000-4000-9845-9344bdb9408c`; // NYC
export const TIMEZONE = 'America/New_York';
//
export const PICKUP_TIME = '1:00PM-1:15PM';
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
		mealName: /^.*?Miso Glazed Salmon.*?/i,
		restaurantName: /^.*?sweetgreen - 32nd + Park.*?/i,
		priority: 1,
	},
	{
		mealName: /^.*?Teriyaki Salmon Bowl.*?/i,
		restaurantName: /^.*?Poke Bowl - 5th Ave.*?/i,
		priority: 2,
	},
	{
		restaurantName: /^.*?sweetgreen - NoMad.*?/i,
		priority: 10,
	},
	{
		restaurantName: /^.*?Poke Bowl - 5th Ave.*?/i,
		priority: 15,
	},
];
