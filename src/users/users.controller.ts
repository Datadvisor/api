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
import { UpdateUserDto } from './dto';
import { User } from './entities';
import { GetUserRo } from './ro';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiOperation({ summary: 'Get all users' })
	@ApiOkResponse({ description: 'Success', type: [GetUserRo] })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get()
	@HttpCode(HttpStatus.OK)
	async getAll(): Promise<GetUserRo[]> {
		const users = await this.usersService.getAll();

		return users.map((user) => new GetUserRo(user));
	}

	@ApiOperation({ summary: 'Get current user' })
	@ApiOkResponse({ description: 'Success', type: GetUserRo })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get('/me')
	@HttpCode(HttpStatus.OK)
	async me(user: User): Promise<GetUserRo> {
		return new GetUserRo(user);
	}

	@ApiOperation({ summary: 'Get a user by id' })
	@ApiOkResponse({ description: 'Success', type: GetUserRo })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Get(':id')
	@HttpCode(HttpStatus.OK)
	async getById(@Param('id') id: string): Promise<GetUserRo | null> {
		const user = await this.usersService.getById(id);

		if (!user) {
			throw new NotFoundException('User not found');
		}
		return new GetUserRo(user);
	}

	@ApiOperation({ summary: 'Update user' })
	@ApiOkResponse({ description: 'Success', type: GetUserRo })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Patch(':id')
	@HttpCode(HttpStatus.OK)
	async update(@Param('id') id: string, @Body() payload: UpdateUserDto): Promise<GetUserRo | null> {
		const { email } = payload;
		const user = await this.usersService.getById(id);

		if (!user) {
			throw new NotFoundException('User not found');
		}

		if (email && (await this.usersService.getByEmail(email))) {
			throw new ConflictException('Email address already associated to another user account');
		}
		return new GetUserRo(await this.usersService.update(id, payload));
	}

	@ApiOperation({ summary: 'Delete user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiNotFoundResponse({ description: 'Not found' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async delete(@Param('id') id: string): Promise<void> {
		const user = await this.usersService.getById(id);

		if (!user) {
			throw new NotFoundException('User not found');
		}
		await this.usersService.delete(id);
	}
}
