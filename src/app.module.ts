import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { PostgresModule } from '@app/postgres';
import { RedisModule } from '@app/redis';
import { UsersModule } from '@app/users';

@Module({
	imports: [ConfigModule, LoggerModule, PostgresModule, RedisModule, UsersModule],
})
export class AppModule {}
