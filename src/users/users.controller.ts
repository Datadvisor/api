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
	Param,
	Patch,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiForbiddenResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthOwner } from '../auth/decorators/auth-owner.decorator';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { SubscriberConflictException } from '../newsletter/exceptions/subscriber-conflict.exception';
import { SubscriberNotFoundException } from '../newsletter/exceptions/subscriber-not-found.exception';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { Role } from './entities/user.entity';
import { UserConflictException } from './exceptions/user-conflict.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserRo } from './ro/user.ro';
import { UserPreferencesRo } from './ro/user-preferences.ro';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: 'Get a list of users' })
	@ApiOkResponse({ description: 'Success', type: [UserRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get()
	@AuthUser(Role.ADMIN)
	@HttpCode(HttpStatus.OK)
	async getAll(): Promise<UserRo[]> {
		const users = await this.usersService.getAll();

		return users.map((user) => new UserRo(user));
	}

	@ApiOperation({ summary: 'Get a user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get(':id')
	@AuthOwner()
	@HttpCode(HttpStatus.OK)
	async getById(@Param('id') id: string): Promise<UserRo | null> {
		try {
			return new UserRo(await this.usersService.getById(id));
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: "Get user's preferences" })
	@ApiOkResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get(':id/preferences')
	@AuthOwner()
	@HttpCode(HttpStatus.OK)
	async getPreferences(@Param('id') userId: string): Promise<UserPreferencesRo | null> {
		try {
			return new UserPreferencesRo(await this.usersService.getPreferences(userId));
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Update a user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch(':id')
	@AuthOwner()
	@HttpCode(HttpStatus.OK)
	async update(@Param('id') id: string, @Body() payload: UpdateUserDto): Promise<UserRo | null> {
		try {
			return new UserRo(await this.usersService.update(id, payload));
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			} else if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: "Update user's preferences" })
	@ApiOkResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch(':id/preferences')
	@AuthOwner()
	@HttpCode(HttpStatus.OK)
	async updatePreferences(
		@Param('id') userId: string,
		@Body() payload: UpdateUserPreferencesDto,
	): Promise<UserPreferencesRo | null> {
		try {
			return new UserPreferencesRo(await this.usersService.updatePreferences(userId, payload));
		} catch (err) {
			if (err instanceof UserNotFoundException || err instanceof SubscriberNotFoundException) {
				throw new NotFoundException(err.message);
			} else if (err instanceof SubscriberConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Delete a user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Delete(':id')
	@AuthOwner()
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param('id') id: string): Promise<void> {
		try {
			await this.usersService.delete(id);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			}
			throw err;
		}
	}
}
