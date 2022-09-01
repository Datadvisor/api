import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { SendEmailDto } from './dto';
import { EmailSendException } from './exceptions';

@Injectable()
export class EmailService {
	constructor(private readonly configService: ConfigService) {
		SendGrid.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
	}

	async send(payload: SendEmailDto): Promise<void> {
		try {
			await SendGrid.send(payload);
		} catch (err) {
			throw new EmailSendException('Cannot send email');
		}
	}
}
