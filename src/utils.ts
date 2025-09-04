import { NOTIFICATION_FROM_EMAIL, NOTIFICATION_TO_EMAIL, TIMEZONE } from './settings';
import sgMail from '@sendgrid/mail';

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
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
	sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? '');

	const result = await sgMail.send({
		to: NOTIFICATION_TO_EMAIL,
		from: NOTIFICATION_FROM_EMAIL,
		subject: `< Autopal >`,
		text: message.trim(),
	});

	return result;
}
