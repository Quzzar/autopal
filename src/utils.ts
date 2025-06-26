export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDate(dayOffset: number = 0) {
	return new Date(Date.now() + 86400000 * dayOffset)
		.toISOString()
		.split('T')[0];
}

export function getRandomNumber(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
