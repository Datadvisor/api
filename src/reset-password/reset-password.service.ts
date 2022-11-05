import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as ejs from 'ejs';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import * as path from 'path';

import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SendResetPasswordEmailDto } from './dto/send-reset-password-email.dto';
import { InvalidTokenException } from './exceptions/invalid-token.exception';
import { ResetPasswordTokenPayloadType } from './reset-password.type';

@Injectable()
export class ResetPasswordService {
	constructor(
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService,
		private readonly usersService: UsersService,
	) {}

	async send(payload: SendResetPasswordEmailDto): Promise<void> {
		const { email } = payload;
		const user = await this.usersService.getByEmail(email);
		const token = await this.jwtService.signAsync(
			{ email },
			{ secret: `${this.configService.get<string>('api.reset-password.jwtSecret')}${user.password}` },
		);
		const link = `${this.configService.get<string>('api.frontend.url')}/reset-password/verify?token=${token}`;
		const html = await ejs.renderFile(
			path.join(__dirname, this.configService.get<string>('api.reset-password.emailTemplatePath')),
			{ email, link },
		);

		await this.emailService.send({
			from: {
				name: this.configService.get<string>('api.email.senderName'),
				email: this.configService.get<string>('api.email.senderEmail'),
			},
			to: email,
			subject: 'Datadvisor - Reset password',
			html,
		});
	}

	async reset(token: string, payload: ResetPasswordDto): Promise<void> {
		try {
			const { email } = this.jwtService.decode(token) as ResetPasswordTokenPayloadType;
			const user = await this.usersService.getByEmail(email);

			await this.jwtService.verifyAsync<ResetPasswordTokenPayloadType>(token, {
				secret: `${this.configService.get<string>('api.reset-password.jwtSecret')}${user.password}`,
			});
			await this.usersService.update(user.id, payload);
		} catch (err) {
			if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
				throw new InvalidTokenException('Invalid or expired token');
			}
			throw err;
		}
	}
}
