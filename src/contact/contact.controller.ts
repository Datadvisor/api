import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiInternalServerErrorResponse,
	ApiNoContentResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';

import { SendContactRequestDto } from './dto';
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
	async send(@Body() payload: SendContactRequestDto): Promise<void> {
		await this.contactService.send(payload);
	}
}
