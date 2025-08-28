import { TIMEZONE } from './settings';

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

// export function sendNotification(message: string) {
// 	const transporter = nodemailer.createTransport({
// 		service: 'gmail',
// 		auth: {
// 			user: 'your-email@gmail.com',
// 			pass: 'your-app-password', // generate an app password, don’t use real password
// 		},
// 	});
// }
