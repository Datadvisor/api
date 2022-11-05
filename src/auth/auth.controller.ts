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

import { ISession } from '../session/session.type';
import { UserConflictException } from '../users/exceptions/user-conflict.exception';
import { UserNotFoundException } from '../users/exceptions/user-not-found.exception';
import { UserRo } from '../users/ro/user.ro';
import { AuthService } from './auth.service';
import { AuthUser } from './decorators/auth-user.decorator';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { UnauthorizedAuthException } from './exceptions/unauthorized-auth.exception';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOperation({ summary: 'Signup a user' })
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

	@ApiOperation({ summary: 'Sign-in a user' })
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

	@ApiOperation({ summary: 'Sign-out a user' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/signout')
	@AuthUser()
	@HttpCode(HttpStatus.NO_CONTENT)
	/* istanbul ignore next */
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
