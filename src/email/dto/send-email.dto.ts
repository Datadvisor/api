import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SendEmailDto {
	@ApiProperty()
	@IsEmail()
	from: string;

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
