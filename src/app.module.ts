import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';
import { PostgresModule } from '@app/postgres';

@Module({
	imports: [ConfigModule, LoggerModule, PostgresModule],
})
export class AppModule {}
