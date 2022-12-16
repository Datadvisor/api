import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Frequency, Preferences, Scrapper } from '../entities/user.entity';

export class UserPreferencesRo {
	constructor(partial: Partial<Preferences>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: string;

	@ApiProperty()
	newsletter: boolean;

	@ApiProperty()
	@Exclude()
	activitiesReport: boolean;

	@ApiProperty()
	@Exclude()
	activitiesReportFrequency: Frequency;

	@ApiProperty()
	@Exclude()
	activitiesReportScrapper: Scrapper;

	@Exclude()
	userId: string;
}
