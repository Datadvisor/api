import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { ContactService } from './contact.service';
import { SendContactEmailDto } from './dto/send-contact-email.dto';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
	constructor(private readonly contactService: ContactService) {}

	@ApiOperation({ summary: 'Send a contact email' })
	@ApiNoContentResponse({ description: 'Success' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post()
	@HttpCode(HttpStatus.NO_CONTENT)
	async send(@Body() payload: SendContactEmailDto): Promise<void> {
		await this.contactService.send(payload);
	}
}
