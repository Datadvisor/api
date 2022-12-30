import { Body, ConflictException, Controller, HttpCode, HttpStatus, Injectable, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { UserConflictException } from '../users/exceptions/user-conflict.exception';
import { PostPaymentDetailsDto } from './dto/post-payment-details.dto';
import { PaymentService } from './payment.service';

@Injectable()
@ApiTags('payment')
@Controller('payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@ApiOperation({ summary: 'Initiate payment session' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/initiate-session')
	@HttpCode(HttpStatus.NO_CONTENT)
	async initiatePaymentSession(@Body() payload: PostPaymentDetailsDto): Promise<void> {
		try {
			await this.paymentService.initiatePaymentSession(payload);
		} catch (err) {
			if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}
}
