import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';

import { Frequency, Scrapper } from '../entities/user.entity';

export class UpdateUserActivitiesReportPreferencesDto {
	@ApiProperty()
	@IsBoolean()
	activitiesReport: boolean;

	@ApiProperty()
	@IsEnum(Frequency)
	activitiesReportFrequency: Frequency;

	@ApiProperty()
	@IsEnum(Scrapper)
	activitiesReportScrapper: Scrapper;
}
