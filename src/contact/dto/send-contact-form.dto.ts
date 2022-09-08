import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class SendContactFormDto {
	@ApiProperty()
	@IsString()
	lastName: string;

	@ApiProperty()
	@IsString()
	firstName: string;

	@ApiPropertyOptional({})
	@IsString()
	@IsOptional()
	company: string;

	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiPropertyOptional()
	@IsPhoneNumber()
	@IsOptional()
	phone: string;

	@ApiProperty()
	@IsString()
	subject: string;

	@ApiProperty()
	@IsString()
	message: string;
}
