import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { PostgresModule } from '@app/postgres';
import { RedisModule } from '@app/redis';
import { SessionModule } from '@app/session';
import { UsersModule } from '@app/users';

@Module({
	imports: [ConfigModule, LoggerModule, PostgresModule, RedisModule, SessionModule, UsersModule],
})
export class AppModule {}
