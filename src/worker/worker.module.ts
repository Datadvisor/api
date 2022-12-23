import { Module } from '@nestjs/common';

import { EmailModule } from '../email/email.module';
import { ScrapperModule } from '../scrapper/scrapper.module';
import { UsersModule } from '../users/users.module';
import { WorkerService } from './worker.service';

@Module({
	imports: [EmailModule, EmailModule, ScrapperModule, UsersModule],
	providers: [WorkerService],
	exports: [WorkerService],
})
export class WorkerModule {}
