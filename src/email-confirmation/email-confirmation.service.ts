import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as path from 'path';

import { EmailService } from '../email';
import { UsersService } from '../users';
import { EmailAlreadyConfirmedException, InvalidTokenException } from './exceptions';
import { User, Role } from '../users/entities';
import { EmailConfirmationTokenPayloadType } from './email-confirmation.type';

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
		if (user.role !== Role.UNCONFIRMED_USER) {
			throw new EmailAlreadyConfirmedException('Email already confirmed');
		}

		const token = await this.jwtService.signAsync({ email: user.email });
		const link = `${this.configService.get<string>('api.frontend.url')}/email-confirmation/verify?token=${token}`;
		const html = await ejs.renderFile(
			path.join(__dirname, this.configService.get<string>('api.email-confirmation.emailTemplatePath')),
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
		let payload: EmailConfirmationTokenPayloadType;

		try {
			payload = await this.jwtService.verifyAsync<EmailConfirmationTokenPayloadType>(token);
		} catch (err) {
			throw new InvalidTokenException('Invalid or expired token');
		}
		const user = await this.usersService.getByEmail(payload.email);

		if (user.role !== Role.UNCONFIRMED_USER) {
			throw new EmailAlreadyConfirmedException('Email already confirmed');
		}
		await this.usersService.updateRole(user.id, Role.USER);
	}
}
