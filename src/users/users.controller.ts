import {
	Controller,
	Get,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
	NotFoundException,
	ConflictException,
	UseInterceptors,
	ClassSerializerInterceptor,
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

import { UsersService } from './users.service';
import { AuthUser } from '../auth/decorators';
import { UserRo } from './ro';
import { Role, User } from './entities';
import { CurrentUser } from './decorators';
import { UserConflictException, UserNotFoundException } from './exceptions';
import { UpdateUserDto } from './dto';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: 'Get all users' })
	@ApiOkResponse({ description: 'Success', type: [UserRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get()
	@AuthUser(undefined, Role.ADMIN)
	@HttpCode(HttpStatus.OK)
	async getAll(): Promise<UserRo[]> {
		const users = await this.usersService.getAll();

		return users.map((user) => new UserRo(user));
	}

	@ApiOperation({ summary: 'Get current user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/me')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async me(@CurrentUser() user: User): Promise<UserRo> {
		return new UserRo(user);
	}

	@ApiOperation({ summary: 'Get user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get(':id')
	@AuthUser('id')
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

	@ApiOperation({ summary: 'Update user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch(':id')
	@AuthUser('id')
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

	@ApiOperation({ summary: 'Delete user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'Forbidden' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Delete(':id')
	@AuthUser('id')
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
