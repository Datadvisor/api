import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const mailchimpConfig = registerAs('mailchimp', () => ({
	api: {
		key: env.get('MAILCHIMP_API_KEY').required(true).asString(),
		server: env.get('MAILCHIMP_API_SERVER').required(true).asString(),
	},
}));
