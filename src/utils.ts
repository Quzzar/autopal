import { TIMEZONE } from './settings';

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDate(dayOffset: number = 0): string {
	const now = new Date();
	// Add the offset (in ms)
	now.setDate(now.getDate() + dayOffset);

	// Format for NYC timezone
	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});

	// This gives YYYY-MM-DD in en-CA locale
	return formatter.format(now);
}

export function getRandomNumber(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
