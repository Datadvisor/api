import { Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { EmailSendException } from '../email/exceptions';
import { SendContactFormDto } from './dto';
import { ContactEmailRenderException } from './exceptions';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@ApiOperation({ summary: 'Send an email to Datadvisor team' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async send(@Body() payload: SendContactFormDto): Promise<void> {
		try {
			await this.contactService.send(payload);
		} catch (err) {
			if (err instanceof ContactEmailRenderException || err instanceof EmailSendException) {
				throw new InternalServerErrorException();
			}
			throw err;
		}
	}
}
