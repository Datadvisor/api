import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class PostPaymentDetailsDto {
	@ApiProperty()
	@IsString()
	customer_email: string;

	@IsString()
	customer_card_number: string;

	@IsString()
	customer_card_exp_month: string;

	@IsString()
	customer_card_exp_year: string;

	@IsString()
	customer_card_cvc: string;
}