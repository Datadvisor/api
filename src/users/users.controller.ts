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
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UserRo } from './ro';
import { User } from './entities';
import { UpdateUserDto } from './dto';
import { UserConflictException, UserNotFoundException } from './exceptions';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: 'Get all users' })
	@ApiOkResponse({ description: 'Success', type: [UserRo] })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get()
	@HttpCode(HttpStatus.OK)
	async getAll(): Promise<UserRo[]> {
		const users = await this.usersService.getAll();

		return users.map((user) => new UserRo(user));
	}

	@ApiOperation({ summary: 'Get current user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/me')
	@HttpCode(HttpStatus.OK)
	async me(user: User): Promise<UserRo> {
		return new UserRo(user);
	}

	@ApiOperation({ summary: 'Get a user by id' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getById(@Param('id') id: string): Promise<UserRo | null> {
		try {
			return new UserRo(await this.usersService.getById(id));
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			}
		}
	}

	@ApiOperation({ summary: 'Update user' })
	@ApiOkResponse({ description: 'Success', type: UserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch(':id')
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
		}
	}

	@ApiOperation({ summary: 'Delete user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param('id') id: string): Promise<void> {
		try {
			await this.usersService.delete(id);
		} catch (err) {
			if (err instanceof UserNotFoundException) {
				throw new NotFoundException(err.message);
			}
		}
	}
}
