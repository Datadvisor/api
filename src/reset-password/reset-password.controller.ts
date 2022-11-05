import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import { ResetPasswordService } from './reset-password.service';

@ApiTags('reset-password')
@Controller('reset-password')
export class ResetPasswordController {
	constructor(private readonly resetPasswordService: ResetPasswordService) {}

	@ApiOperation({ summary: 'Send a password reset email to a user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async send(@Body() payload: SendResetPasswordEmailDto): Promise<void> {
		try {
			await this.resetPasswordService.send(payload);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				return;
			}
			throw err;
		}
	}

	@ApiOperation({ summary: "Reset a user's password" })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('reset/:token')
	@HttpCode(HttpStatus.NO_CONTENT)
	async reset(@Param('token') token: string, @Body() payload: ResetPasswordDto): Promise<void> {
		try {
			await this.resetPasswordService.reset(token, payload);
		} catch (err) {
			if (err instanceof InvalidTokenException || err instanceof UserNotFoundException) {
				throw new BadRequestException('Invalid or expired token');
			}
			throw err;
		}
	}
}
