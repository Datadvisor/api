import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { SendEmailDto } from './dto';

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	constructor(private readonly configService: ConfigService) {
		SendGrid.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
	}

	async send(payload: SendEmailDto): Promise<void> {
		try {
			await SendGrid.send(payload);
		} catch (err) {
			this.logger.error(err.message);
			throw err;
		}
	}
}
