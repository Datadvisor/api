import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import apiConfig from './api.config';
import postgresConfig from './postgres.config';
import redisConfig from './redis.config';

@Module({
	imports: [
		NestConfigModule.forRoot({
			cache: true,
			isGlobal: true,
			load: [apiConfig, postgresConfig, redisConfig],
		}),
	],
})
export class ConfigModule {}
