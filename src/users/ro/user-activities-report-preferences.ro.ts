import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Frequency, Preferences, Scrapper } from '../entities/user.entity';

export class UserActivitiesReportPreferencesRo {
	constructor(partial: Partial<Preferences>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: string;

	@ApiProperty()
	@Exclude()
	newsletter: boolean;

	@ApiProperty()
	activitiesReport: boolean;

	@ApiProperty()
	activitiesReportFrequency: Frequency;

	@ApiProperty()
	activitiesReportScrapper: Scrapper;

	@Exclude()
	userId: string;
}
