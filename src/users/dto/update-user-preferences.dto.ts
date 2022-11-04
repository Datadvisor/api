import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserPreferencesDto {
	@ApiProperty()
	@IsBoolean()
	newsletter: boolean;
}
