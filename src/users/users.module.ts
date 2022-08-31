import { Module } from '@nestjs/common';

import { PostgresModule } from '../postgres';
import { UserController } from './user.controller';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [PostgresModule],
	controllers: [UserController, UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
