import { registerAs } from '@nestjs/config';
import * as env from 'env-var';

export const scrapperConfig = registerAs('scrapper', () => ({
	url: env.get('SCRAPPER_URL').required(true).asString(),
}));
