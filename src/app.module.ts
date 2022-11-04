import { Module } from '@nestjs/common';

import { AuthModule } from './auth';
import { ConfigModule } from './config';
import { ContactModule } from './contact';
import { EmailModule } from './email';
import { EmailConfirmationModule } from './email-confirmation';
import { LoggerModule } from './logger';
import { PostgresModule } from './postgres';
import { RedisModule } from './redis';
import { ResetPasswordModule } from './reset-password';
import { SessionModule } from './session';
import { UsersModule } from './users';
import { NewsletterModule } from './newsletter';

@Module({
	imports: [
		AuthModule,
		ConfigModule,
		ContactModule,
		EmailModule,
		EmailConfirmationModule,
		LoggerModule,
		NewsletterModule,
		PostgresModule,
		RedisModule,
		ResetPasswordModule,
		SessionModule,
		UsersModule,
	],
})
export class AppModule {}
