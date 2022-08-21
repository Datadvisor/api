import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export default registerAs('api', () => ({
	host: env.get('API_HOST').required(true).asString(),
	port: env.get('API_PORT').required(true).asPortNumber(),
	cors: {
		origins: env.get('API_CORS_ORIGINS').default(['*']).asArray(),
		headers: env.get('API_CORS_HEADERS').default(['*']).asArray(),
	},
	logs: {
		combinedPath: env.get('API_LOGS_COMBINED_PATH').default('logs/combined.log').asString(),
		errorPath: env.get('API_LOGS_ERROR_PATH').default('logs/error.log').asString(),
	},
}));
