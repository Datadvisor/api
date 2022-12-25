import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Frequency, Preferences, Scrapper } from '../entities/user.entity';

export class UserActivitiesReportPreferencesRo {
	constructor(partial: Partial<Preferences>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: string;

	@Exclude()
	newsletter: boolean;

	@ApiProperty()
	activitiesReport: boolean;

	@ApiProperty({ enum: Frequency })
	activitiesReportFrequency: Frequency;

	@ApiProperty({ enum: Scrapper })
	activitiesReportScrapper: Scrapper;

	@Exclude()
	userId: string;
}
