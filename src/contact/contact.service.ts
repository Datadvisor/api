import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';

import { EmailService } from '../email/email.service';
import { relativeOrAbsolutePath } from '../utils/utils';
import { SendContactEmailDto } from './dto/send-contact-email.dto';

@Injectable()
export class ContactService {
	constructor(private readonly configService: ConfigService, private readonly emailService: EmailService) {}

	async send(payload: SendContactEmailDto): Promise<void> {
		const html = await ejs.renderFile(
			relativeOrAbsolutePath(__dirname, this.configService.get<string>('api.contact.emailTemplatePath')),
			payload,
		);

		await this.emailService.send({
			from: {
				name: this.configService.get<string>('api.email.senderName'),
				email: this.configService.get<string>('api.email.senderEmail'),
			},
			to: this.configService.get<string>('api.contact.recipientEmail'),
			subject: 'Datadvisor - Contact request',
			html,
		});
	}
}
