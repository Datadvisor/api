import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export default registerAs('postgres', () => ({
	url: env.get('POSTGRES_URL').required(true).asString(),
}));
