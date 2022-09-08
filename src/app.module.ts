import { Module } from '@nestjs/common';

import { AuthModule } from './auth';
import { ConfigModule } from './config';
import { ContactModule } from './contact';
import { EmailModule } from './email';
import { LoggerModule } from './logger';
import { PostgresModule } from './postgres';
import { RedisModule } from './redis';
import { SessionModule } from './session';
import { UsersModule } from './users';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		ContactModule,
		EmailModule,
		LoggerModule,
		PostgresModule,
		RedisModule,
		SessionModule,
		UsersModule,
	],
})
export class AppModule {}
