import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

import { SendEmailDto } from './dto';

@Injectable()
export class EmailService {
	constructor(private readonly configService: ConfigService) {
		SendGrid.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
	}

	async send(payload: SendEmailDto): Promise<void> {
		await SendGrid.send(payload);
	}
}
