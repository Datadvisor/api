import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export default registerAs('api', () => ({
	host: env.get('API_HOST').required(true).asString(),
	port: env.get('API_PORT').required(true).asPortNumber(),
	cors: {
		origins: env.get('API_CORS_ORIGINS').default(['*']).asArray(),
	},
}));
