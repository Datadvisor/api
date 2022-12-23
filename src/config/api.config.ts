import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const apiConfig = registerAs('api', () => ({
	host: env.get('API_HOST').required(true).asString(),
	port: env.get('API_PORT').required(true).asPortNumber(),
	env: env.get('NODE_ENV').required(true).asString(),
	saltRounds: env.get('API_SALT_ROUNDS').default(10).asIntPositive(),
	cors: {
		origins: env.get('API_CORS_ORIGINS').default('*').asArray(),
	},
	contact: {
		emailTemplatePath: env
			.get('API_CONTACT_EMAIL_TEMPLATE_PATH')
			.default('views/contact-email.view.ejs')
			.asString(),
		recipientEmail: env.get('API_CONTACT_RECIPIENT_EMAIL').required(true).asString(),
	},
	email: {
		senderName: env.get('API_EMAIL_SENDER_NAME').required(true).asString(),
		senderEmail: env.get('API_EMAIL_SENDER_EMAIL').required(true).asString(),
	},
	'email-confirmation': {
		emailTemplatePath: env
			.get('API_EMAIL_CONFIRMATION_EMAIL_TEMPLATE_PATH')
			.default('views/email-confirmation-email.view.ejs')
			.asString(),
		jwtSecret: env.get('API_EMAIL_CONFIRMATION_JWT_SECRET').required(true).asString(),
		jwtExpirationTime: env.get('API_EMAIL_CONFIRMATION_JWT_EXPIRATION_TIME').default('60m').asString(),
	},
	frontend: {
		url: env.get('API_FRONTEND_URL').required(true).asString(),
	},
	logs: {
		combinedPath: env.get('API_LOGS_COMBINED_PATH').default('logs/combined.log').asString(),
		errorPath: env.get('API_LOGS_ERROR_PATH').default('logs/error.log').asString(),
	},
	newsletter: {
		listId: env.get('API_NEWSLETTER_LIST_ID').required(true).asString(),
	},
	'reset-password': {
		emailTemplatePath: env
			.get('API_RESET_PASSWORD_EMAIL_TEMPLATE_PATH')
			.default('views/reset-password-email.view.ejs')
			.asString(),
		jwtSecret: env.get('API_RESET_PASSWORD_JWT_SECRET').required(true).asString(),
		jwtExpirationTime: env.get('API_RESET_PASSWORD_JWT_EXPIRATION_TIME').default('60m').asString(),
	},
	session: {
		secret: env.get('API_SESSION_SECRET').required(true).asString(),
		secure: env.get('API_SESSION_SECURE').default('false').asBool(),
		httpOnly: env.get('API_SESSION_HTTP_ONLY').default('false').asBool(),
		maxAge: env.get('API_SESSION_MAX_AGE').default(86400000).asIntPositive(),
	},
	worker: {
		activitiesReport: {
			monthlyCronSchedule: env
				.get('API_WORKER_ACTIVITIES_REPORT_MONTHLY_CRON_SCHEDULE')
				.default('*/2 * * * *')
				.asString(),
			bimonthlyCronSchedule: env
				.get('API_WORKER_ACTIVITIES_REPORT_BIMONTHLY_CRON_SCHEDULE')
				.default('*/2 * * * *')
				.asString(),
			emailTemplatePath: env
				.get('API_WORKER_ACTIVITIES_REPORT_EMAIL_TEMPLATE_PATH')
				.default('worker/views/worker-activities-report-email.view.ejs')
				.asString(),
		},
	},
}));
