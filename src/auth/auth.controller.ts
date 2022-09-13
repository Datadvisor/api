import {
	Body,
	ClassSerializerInterceptor,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Session,
	UnauthorizedException,
	UseInterceptors,
} from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto';
import { UserRo } from '../users/ro';
import { UserConflictException, UserNotFoundException } from '../users/exceptions';
import { UnauthorizedAuthException } from './exceptions';
import { AuthUser } from './decorators';
import { ISession } from '../session';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ summary: 'Signup user' })
	@ApiCreatedResponse({ description: 'Success', type: [UserRo] })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiConflictResponse({ description: 'Conflict' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/signup')
	@HttpCode(HttpStatus.CREATED)
	async signup(@Body() payload: SignupDto): Promise<UserRo | null> {
		try {
			return new UserRo(await this.authService.signup(payload));
		} catch (err) {
			if (err instanceof UserConflictException) {
				throw new ConflictException(err.message);
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Signin user' })
	@ApiOkResponse({ description: 'Success', type: [UserRo] })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/signin')
	@HttpCode(HttpStatus.OK)
	async signin(@Body() payload: SigninDto, @Session() session: ISession): Promise<UserRo | null> {
		try {
			const user = await this.authService.signin(payload);

			session.user = { id: user.id };
			session.save();
			return new UserRo(user);
		} catch (err) {
			if (err instanceof UserNotFoundException || err instanceof UnauthorizedAuthException) {
				throw new UnauthorizedException('Invalid username or password');
			}
			throw err;
		}
	}

	@ApiOperation({ summary: 'Signout user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/signout')
	@AuthUser()
	@HttpCode(HttpStatus.NO_CONTENT)
	async signout(@Session() session: ISession): Promise<void> {
		await new Promise<void>((resolve, reject) => {
			session.destroy((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
