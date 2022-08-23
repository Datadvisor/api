import { Module } from '@nestjs/common';

import { ConfigModule } from '@app/config';
import { LoggerModule } from '@app/logger';

@Module({
	imports: [ConfigModule, LoggerModule],
})
export class AppModule {}
