import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const postgresConfig = registerAs('postgres', () => ({
	url: env.get('POSTGRES_URL').required(true).asString(),
}));
