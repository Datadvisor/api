import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { apiConfig } from './api.config';
import { mailchimpConfig } from './mailchimp.config';
import { postgresConfig } from './postgres.config';
import { redisConfig } from './redis.config';
import { scrapperConfig } from './scrapper.config';
import { sendgridConfig } from './sendgrid.config';

@Module({
	imports: [
		NestConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			load: [apiConfig, mailchimpConfig, postgresConfig, redisConfig, scrapperConfig, sendgridConfig],
		}),
	],
})
export class ConfigModule {}
