import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiGoneResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
	BadRequestException,
	ConflictException,
	Controller,
	Get,
	GoneException,
	HttpCode,
	HttpStatus,
	Post,
	Query,
} from '@nestjs/common';

import { EmailConfirmationService } from './email-confirmation.service';
import { AuthUser } from '../auth/decorators';
import { CurrentUser } from '../users/decorators';
import { User } from '../users/entities';
import { EmailAlreadyConfirmedException, InvalidTokenException } from './exceptions';

@ApiTags('email-confirmation')
@Controller('email-confirmation')
export class EmailConfirmationController {
	constructor(private readonly emailConfirmationService: EmailConfirmationService) {}

	@ApiOperation({ summary: 'Send an email to validate user email' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post()
	@AuthUser()
	@HttpCode(HttpStatus.NO_CONTENT)
	async send(@CurrentUser() user: User): Promise<void> {
		try {
			await this.emailConfirmationService.send(user.email);
		} catch (err) {
			if (err instanceof EmailAlreadyConfirmedException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Verify user email' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiGoneResponse({ description: 'Gone' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('verify')
	@HttpCode(HttpStatus.NO_CONTENT)
	async verify(@Query('token') token: string): Promise<void> {
		try {
			await this.emailConfirmationService.verify(token);
		} catch (err) {
			if (err instanceof EmailAlreadyConfirmedException) {
				throw new GoneException(err.message);
			} else if (err instanceof InvalidTokenException) {
				throw new BadRequestException(err.message);
			}
			throw err;
		}
	}
}
