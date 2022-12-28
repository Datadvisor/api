import { Module } from '@nestjs/common';

import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { PaymentModule } from '../payment/payment.module';
import { PostgresModule } from '../postgres/postgres.module';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [EmailConfirmationModule, NewsletterModule, PostgresModule, PaymentModule],
	controllers: [UserController, UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
