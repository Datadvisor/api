import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

class SendEmailFromDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsEmail()
	email: string;
}

class SendEmailAttachmentDto {
	@ApiProperty()
	@IsString()
	content: string;

	@ApiProperty()
	@IsString()
	filename: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	type: string;

	@ApiProperty()
	@IsOptional()
	@IsString()
	disposition: string;
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

	@ApiProperty()
	@IsOptional()
	@ValidateNested()
	@Type(() => SendEmailAttachmentDto)
	attachments?: SendEmailAttachmentDto[];
}
