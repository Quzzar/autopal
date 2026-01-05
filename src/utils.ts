import { NOTIFICATION_FROM_EMAIL, NOTIFICATION_TO_EMAIL, TIMEZONE } from './settings/general';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
	return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function getDate(dayOffset: number = 0): string {
	const now = new Date();
	now.setDate(now.getDate() + dayOffset);

	const formatter = new Intl.DateTimeFormat('en-CA', {
		timeZone: TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});

	return formatter.format(now);
}

export function getRandomNumber(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function sendNotification(message: string) {
	const mailgun = new Mailgun(FormData);
	const mg = mailgun.client({
		username: 'api',
		key: process.env.MAILGUN_API_KEY ?? '',
	});
	try {
		const data = await mg.messages.create(process.env.MAILGUN_DOMAIN ?? '', {
			from: NOTIFICATION_FROM_EMAIL,
			to: ['aaronncassar@gmail.com'],
			subject: `< Autopal >`,
			text: message.trim(),
		});

		console.log(data);
		return data;
	} catch (error) {
		console.log(error);
	}
}
