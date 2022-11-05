import {
	BadRequestException,
	ConflictException,
	Controller,
	GoneException,
	HttpCode,
	HttpStatus,
	Param,
	Post,
} from '@nestjs/common';
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

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { EmailConfirmationService } from './email-confirmation.service';
import { EmailAlreadyConfirmedException } from './exceptions/email-already-confirmed.exception.ts';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

@ApiTags('email-confirmation')
@Controller('email-confirmation')
export class EmailConfirmationController {
	constructor(private readonly emailConfirmationService: EmailConfirmationService) {}

	@ApiOperation({ summary: 'Send a confirmation email to a user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post()
	@AuthUser()
	@HttpCode(HttpStatus.NO_CONTENT)
	async send(@CurrentUser() user: User): Promise<void> {
		try {
			await this.emailConfirmationService.send(user);
		} catch (err) {
			if (err instanceof EmailAlreadyConfirmedException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Confirm a user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiGoneResponse({ description: 'Gone' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('confirm/:token')
	@HttpCode(HttpStatus.NO_CONTENT)
	async confirm(@Param('token') token: string): Promise<void> {
		try {
			await this.emailConfirmationService.confirm(token);
		} catch (err) {
			if (err instanceof EmailAlreadyConfirmedException) {
				throw new GoneException(err.message);
			} else if (err instanceof InvalidTokenException || err instanceof UserNotFoundException) {
				throw new BadRequestException('Invalid or expired token');
			}
			throw err;
		}
	}
}
