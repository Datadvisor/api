import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';

import { PostPaymentDetailsDto } from './dto/post-payment-details.dto';

@Injectable()
export class PaymentService {
	readonly stripe: Stripe;

	constructor(readonly configService: ConfigService) {
		this.stripe = new Stripe(this.configService.get<string>('api.stripe.publishableApiKey'), {
			apiVersion: '2022-11-15',
		});
	}

	async createPaymentSubscription(
		payload: PostPaymentDetailsDto,
		token: Stripe.Token & {
			lastResponse: {
				headers: { [p: string]: string };
				requestId: string;
				statusCode: number;
				apiVersion?: string;
				idempotencyKey?: string;
				stripeAccount?: string;
			};
		},
	): Promise<void> {
		try {
			this.stripe.customers
				.create({
					email: payload.customer_email,
					source: token.id,
				})
				.then((customer) =>
					this.stripe.subscriptions.create({
						customer: customer.id,
						items: [
							{
								plan: this.configService.get<string>('api.stripe.planId'),
							},
						],
					}),
				)
				.then(() => console.log('success, subscription function there'))
				.catch((err) => console.log(err));
		} catch (err) {
			console.log(`An error occured while processing the payment : ${err}`);
		}
	}

	async initiatePaymentSession(payload: PostPaymentDetailsDto): Promise<void> {
		const cardToken = await this.stripe.tokens.create({
			card: {
				number: payload.customer_card_number,
				exp_month: payload.customer_card_exp_month,
				exp_year: payload.customer_card_exp_year,
				cvc: payload.customer_card_cvc,
			},
		});
		await this.createPaymentSubscription(payload, cardToken);
	}
}
