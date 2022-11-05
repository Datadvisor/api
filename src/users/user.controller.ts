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

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { SubscriberConflictException } from '../newsletter/exceptions/subscriber-conflict.exception';
import { SubscriberNotFoundException } from '../newsletter/exceptions/subscriber-not-found.exception';
import { CurrentUser } from './decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { User } from './entities/user.entity';
import { UserConflictException } from './exceptions/user-conflict.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserRo } from './ro/user.ro';
import { UserPreferencesRo } from './ro/user-preferences.ro';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('user')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
	constructor(private readonly usersService: UsersService) {}

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
	@ApiOkResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/preferences')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getPreferences(@CurrentUser() user: User): Promise<UserPreferencesRo | null> {
		return new UserPreferencesRo(await this.usersService.getPreferences(user.id));
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

	@ApiOperation({ summary: "Update the current user's preferences" })
	@ApiOkResponse({ description: 'Success' })
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
			if (err instanceof UserNotFoundException || err instanceof SubscriberNotFoundException) {
				throw new NotFoundException(err.message);
			} else if (err instanceof SubscriberConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
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
