import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { AddListMemberBody } from '@mailchimp/mailchimp_marketing';

import { SubscriberConflictException, SubscriberNotFoundException } from './exceptions';

@Injectable()
export class NewsletterService {
	constructor(private readonly configService: ConfigService) {
		mailchimp.setConfig({
			apiKey: this.configService.get<string>('mailchimp.api.key'),
			server: this.configService.get<string>('mailchimp.api.server'),
		});
	}

	async subscribe(email: string): Promise<void> {
		const payload: AddListMemberBody = {
			email_address: email,
			status: 'subscribed',
		};

		try {
			await mailchimp.lists.addListMember(this.configService.get<string>('api.newsletter.listId'), payload);
		} catch (err) {
			if (err.status === HttpStatus.BAD_REQUEST) {
				throw new SubscriberConflictException('User already subscribed to the newsletter');
			}
			throw err;
		}
	}

	async unsubscribe(email: string): Promise<void> {
		try {
			await mailchimp.lists.deleteListMember(this.configService.get<string>('api.newsletter.listId'), email);
		} catch (err) {
			if (err.status === HttpStatus.METHOD_NOT_ALLOWED) {
				throw new SubscriberNotFoundException('User not subscribed from the newsletter');
			}
			throw err;
		}
	}
}
