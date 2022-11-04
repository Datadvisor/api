import {
	Body,
	ClassSerializerInterceptor,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { AuthUser } from '../auth/decorators';
import { CurrentUser } from './decorators';
import { User } from './entities';
import { UserRo } from './ro';
import { UpdateUserDto } from './dto';
import { UserConflictException } from './exceptions';

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
