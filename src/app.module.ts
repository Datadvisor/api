import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { Logger as LoggerModule } from '@app/logger';

@Module({
	imports: [ConfigModule, LoggerModule],
})
export class AppModule {}
