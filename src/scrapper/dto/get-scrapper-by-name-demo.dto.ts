import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetScrapperByNameDemoDto {
	@ApiProperty()
	@IsString()
	lastName: string;

	@ApiProperty()
	@IsString()
	firstName: string;
}
