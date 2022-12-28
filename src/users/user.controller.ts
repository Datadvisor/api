import {
	Body,
	ClassSerializerInterceptor,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Patch,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { SubscriberConflictException } from '../newsletter/exceptions/subscriber-conflict.exception';
import { SubscriberNotFoundException } from '../newsletter/exceptions/subscriber-not-found.exception';
import { PostPaymentDetailsDto } from '../payment/dto/post-payment-details.dto';
import { PaymentController } from '../payment/payment.controller';
import { PaymentService } from '../payment/payment.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserActivitiesReportPreferencesDto } from './dto/update-user-activities-report-preferences.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { User } from './entities/user.entity';
import { UserConflictException } from './exceptions/user-conflict.exception';
import { UserRo } from './ro/user.ro';
import { UserActivitiesReportPreferencesRo } from './ro/user-activities-report-preferences.ro';
import { UserPreferencesRo } from './ro/user-preferences.ro';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
	constructor(private readonly usersService: UsersService, private readonly paymentService: PaymentService) {}

	@ApiOperation({ summary: 'Get the current user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get()
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async get(@CurrentUser() user: User): Promise<UserRo> {
		return new UserRo(user);
	}

	@ApiOperation({ summary: "Get the current user's preferences" })
	@ApiOkResponse({ description: 'Success', type: UserPreferencesRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/preferences')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getPreferences(@CurrentUser() user: User): Promise<UserPreferencesRo | null> {
		return new UserPreferencesRo(await this.usersService.getPreferences(user.id));
	}

	@ApiOperation({ summary: "Get the current user's activities report preferences" })
	@ApiOkResponse({ description: 'Success', type: UserActivitiesReportPreferencesRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/preferences/activities-report')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getActivitiesReportPreferences(@CurrentUser() user: User): Promise<UserActivitiesReportPreferencesRo | null> {
		return new UserActivitiesReportPreferencesRo(await this.usersService.getPreferences(user.id));
	}

	@ApiOperation({ summary: 'Update the current user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch()
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async update(@CurrentUser() user: User, @Body() payload: UpdateUserDto): Promise<UserRo | null> {
		try {
			return new UserRo(await this.usersService.update(user.id, payload));
		} catch (err) {
			if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Make the current user be premium' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch('/premium/subscribe')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async setPremium(@CurrentUser() user: User, @Body() payload: SubscribeDto): Promise<UserRo | null> {
		try {
			await this.paymentService.initiatePaymentSession({
				customer_email: user.email,
				customer_card_number: payload.customer_card_number,
				customer_card_exp_year: payload.customer_card_exp_year,
				customer_card_exp_month: payload.customer_card_exp_month,
				customer_card_cvc: payload.customer_card_cvc,
			});
			return new UserRo(await this.usersService.updateRole(user.id, Role.PREMIUM));
		} catch (err) {
			if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Remove the premium status of the current user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch('/premium/unsubscribe')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async unsetPremium(@CurrentUser() user: User): Promise<UserRo | null> {
		try {
			return new UserRo(await this.usersService.updateRole(user.id, Role.USER));
		} catch (err) {
			if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: "Update the current user's preferences" })
	@ApiOkResponse({ description: 'Success', type: UserPreferencesRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch('/preferences')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async updatePreferences(
		@CurrentUser() user: User,
		@Body() payload: UpdateUserPreferencesDto,
	): Promise<UserPreferencesRo | null> {
		try {
			return new UserPreferencesRo(await this.usersService.updatePreferences(user.id, payload));
		} catch (err) {
			if (err instanceof SubscriberNotFoundException) {
				throw new NotFoundException(err.message);
			} else if (err instanceof SubscriberConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: "Update the current user's activities report preferences" })
	@ApiOkResponse({ description: 'Success', type: UserActivitiesReportPreferencesRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch('/preferences/activities-report')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async updateActivitiesReportPreferences(
		@CurrentUser() user: User,
		@Body() payload: UpdateUserActivitiesReportPreferencesDto,
	): Promise<UserActivitiesReportPreferencesRo | null> {
		return new UserActivitiesReportPreferencesRo(
			await this.usersService.updateActivitiesReportPreferences(user.id, payload),
		);
	}

	@ApiOperation({ summary: 'Delete the current user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Delete()
	@AuthUser()
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@CurrentUser() user: User): Promise<void> {
		await this.usersService.delete(user.id);
	}
}
