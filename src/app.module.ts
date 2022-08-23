import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { PostgresModule } from '@app/postgres';
import { RedisModule } from '@app/redis';

@Module({
	imports: [ConfigModule, LoggerModule, PostgresModule, RedisModule],
})
export class AppModule {}
