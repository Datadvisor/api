import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export default registerAs('redis', () => ({
	url: env.get('REDIS_URL').required(true).asString(),
}));
