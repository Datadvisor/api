import { Module } from '@nestjs/common';

import { ConfigModule } from './config';
import { LoggerModule } from './logger';
import { PostgresModule } from './postgres';
import { RedisModule } from './redis';
import { SessionModule } from './session';
import { UsersModule } from './users';

@Module({
	imports: [ConfigModule, LoggerModule, PostgresModule, RedisModule, SessionModule, UsersModule],
})
export class AppModule {}
