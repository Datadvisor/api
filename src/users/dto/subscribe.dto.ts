import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SubscribeDto {
	@ApiProperty()
	@IsString()
	customer_card_number: string;

	@IsString()
	customer_card_exp_month: string;

	@IsString()
	customer_card_exp_year: string;

	@IsString()
	customer_card_cvc: string;
}
