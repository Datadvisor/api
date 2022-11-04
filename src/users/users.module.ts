import { Module } from '@nestjs/common';

import { EmailConfirmationModule } from '../email-confirmation';
import { NewsletterModule } from '../newsletter';
import { PostgresModule } from '../postgres';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [EmailConfirmationModule, NewsletterModule, PostgresModule],
	controllers: [UserController, UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
