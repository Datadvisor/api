import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';

import { ResetPasswordService } from './reset-password.service';
import { ResetPasswordDto, SendResetPasswordEmailDto } from './dto';
import { UserNotFoundException } from '../users/exceptions';
import { InvalidTokenException } from './exceptions';

@ApiTags('reset-password')
@Controller('reset-password')
export class ResetPasswordController {
	constructor(private readonly resetPasswordService: ResetPasswordService) {}

	@ApiOperation({ summary: 'Send an email to reset user password' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiNotFoundResponse({ description: 'Not found' })
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

	@ApiOperation({ summary: 'Reset user password' })
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
