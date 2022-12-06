import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { EmailConfirmationModule } from './email-confirmation/email-confirmation.module';
import { LoggerModule } from './logger/logger.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { PostgresModule } from './postgres/postgres.module';
import { RedisModule } from './redis/redis.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { ScrapperModule } from './scrapper/scrapper.module';
import { SessionModule } from './session/session.module';
import { UsersModule } from './users/users.module';

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
		ScrapperModule,
	],
})
export class AppModule {}
