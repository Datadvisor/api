import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sendGrid from '@sendgrid/mail';

import { SendEmailDto } from './dto';

@Injectable()
export class EmailService {
	constructor(private readonly configService: ConfigService) {
		sendGrid.setApiKey(this.configService.get<string>('sendgrid.apiKey'));
	}

	async send(payload: SendEmailDto): Promise<void> {
		await sendGrid.send({
			...payload,
			mailSettings: {
				sandboxMode: {
					enable: this.configService.get<string>('api.env') === 'test',
				},
			},
		});
	}
}
