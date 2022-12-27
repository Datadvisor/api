import * as mailchimp from '@mailchimp/mailchimp_marketing';
import { AddListMemberBody } from '@mailchimp/mailchimp_marketing';
import { Get, HttpCode, HttpStatus, Injectable, Post, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
} from '@nestjs/swagger';
import { Stripe } from 'stripe';

@Injectable()
export class PaymentService {}
