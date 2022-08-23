import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export default registerAs('redis', () => ({
	host: env.get('REDIS_HOST').required(true).asString(),
	port: env.get('REDIS_PORT').required(true).asPortNumber(),
	password: env.get('REDIS_PASSWORD').required(true).asString(),
}));
