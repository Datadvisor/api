import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as ejs from 'ejs';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { relativeOrAbsolutePath } from '../utils/utils';
import { EmailConfirmationTokenPayloadType } from './email-confirmation.type';
import { EmailAlreadyConfirmedException } from './exceptions/email-already-confirmed.exception.ts';
import { InvalidTokenException } from './exceptions/invalid-token.exception';

@Injectable()
export class EmailConfirmationService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
	) {}

	async send(user: User): Promise<void> {
		if (user.emailVerified) {
			throw new EmailAlreadyConfirmedException('Email already confirmed');
		}

		const token = await this.jwtService.signAsync({ email: user.email });
		const link = `${this.configService.get<string>('api.frontend.url')}/email-confirmation/verify?token=${token}`;
		const html = await ejs.renderFile(
			relativeOrAbsolutePath(
				__dirname,
				this.configService.get<string>('api.email-confirmation.emailTemplatePath'),
			),
			{ email: user.email, link },
		);

		await this.emailService.send({
			from: {
				name: this.configService.get<string>('api.email.senderName'),
				email: this.configService.get<string>('api.email.senderEmail'),
			},
			to: user.email,
			subject: 'Datadvisor - Confirm your email',
			html,
		});
	}

	async confirm(token: string): Promise<void> {
		try {
			const { email } = await this.jwtService.verifyAsync<EmailConfirmationTokenPayloadType>(token);
			const user = await this.usersService.getByEmail(email);

			if (user.emailVerified) {
				throw new EmailAlreadyConfirmedException('Email already confirmed');
			}
			await this.usersService.updateEmailVerified(user.id, true);
		} catch (err) {
			if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
				throw new InvalidTokenException('Invalid or expired token');
			}
			throw err;
		}
	}
}
