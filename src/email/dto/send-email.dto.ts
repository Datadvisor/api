import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsString, ValidateNested } from 'class-validator';

class SendEmailFromDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsEmail()
	email: string;
}

export class SendEmailDto {
	@ApiProperty()
	@ValidateNested()
	@Type(() => SendEmailFromDto)
	from: SendEmailFromDto;

	@ApiProperty()
	@IsEmail()
	to: string;

	@ApiProperty()
	@IsString()
	subject: string;

	@ApiProperty()
	@IsString()
	html: string;
}
