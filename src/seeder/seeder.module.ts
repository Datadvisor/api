import { Module } from '@nestjs/common';

import { PostgresModule } from '../postgres';
import { SeederService } from './seeder.service';

@Module({
	imports: [PostgresModule],
	providers: [SeederService],
	exports: [SeederService],
})
export class SeederModule {}
