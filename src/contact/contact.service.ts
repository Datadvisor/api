import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as path from 'path';

import { EmailService } from '../email';
import { SendContactFormDto } from './dto';
import { ContactEmailRenderException } from './exceptions';

@Injectable()
export class ContactService {
	private readonly logger = new Logger(ContactService.name);

	constructor(private readonly configService: ConfigService, private readonly emailService: EmailService) {}

	async send(payload: SendContactFormDto) {
		let html;

		try {
			html = await ejs.renderFile(
				path.join(__dirname, this.configService.get<string>('api.contact.emailTemplatePath')),
				payload,
			);
		} catch (err) {
			this.logger.error(err.message);
			throw new ContactEmailRenderException(err.message);
		}
		await this.emailService.send({
			from: {
				name: this.configService.get<string>('api.contact.senderName'),
				email: this.configService.get<string>('api.contact.senderEmail'),
			},
			to: this.configService.get<string>('api.contact.recipientEmail'),
			subject: '[Datadvisor] Contact request',
			html,
		});
	}
}
