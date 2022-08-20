import { Module } from '@nestjs/common';

import { Config as ConfigModule } from '@app/config';

@Module({
	imports: [ConfigModule],
})
export class AppModule {}
