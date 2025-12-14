import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
	if (transporter) return transporter;
	if (process.env.SMTP_HOST) {
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: false,
			auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
		});
	} else {
		transporter = {
			sendMail: async (opts) => {
				console.log('MAIL (dev fallback):', opts);
				return { messageId: 'dev-fallback' };
			},
		};
	}
	return transporter;
}

export async function sendMail({ to, subject, text, html }) {
	const from = process.env.MAIL_FROM || 'no-reply@agriconnect.local';
	const t = getTransporter();
	return await t.sendMail({ from, to, subject, text, html });
}


