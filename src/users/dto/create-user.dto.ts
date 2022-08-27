import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
	@IsString()
	@ApiProperty()
	lastName: string;

	@IsString()
	@ApiProperty()
	firstName: string;

	@IsEmail()
	@ApiProperty()
	email: string;

	@IsString()
	@IsOptional()
	@MinLength(8)
	@MaxLength(64)
	@ApiProperty()
	password: string;
}
