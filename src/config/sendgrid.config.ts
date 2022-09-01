import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const sendgridConfig = registerAs('sendgrid', () => ({
	apiKey: env.get('SENDGRID_API_KEY').required(true).asString(),
}));
