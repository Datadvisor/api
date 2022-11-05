import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty()
	@IsString()
	lastName: string;

	@ApiProperty()
	@IsString()
	firstName: string;

	@ApiProperty()
	@IsEmail()
	email: string;

	@ApiProperty()
	@IsString()
	@MinLength(8)
	@MaxLength(64)
	password: string;

	@ApiProperty()
	@IsBoolean()
	newsletter: boolean;
}
