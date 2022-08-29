import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const redisConfig = registerAs('redis', () => ({
	url: env.get('REDIS_URL').required(true).asString(),
}));
