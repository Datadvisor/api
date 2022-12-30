import {
	Body,
	Controller,
	FileTypeValidator,
	HttpCode,
	HttpStatus,
	MaxFileSizeValidator,
	ParseFilePipe,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiConsumes,
	ApiInternalServerErrorResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';

import { AuthUser } from '../auth/decorators/auth-user.decorator';
import {
	GetByEmailRequest,
	GetByFaceRequest,
	GetByNameRequest,
	GetByResumeRequest,
	ScrapperEmail,
	ScrapperFace,
	ScrapperName,
	ScrapperResume,
} from '../protos/scrapper/scrapper';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { GetScrapperByNameDemoDto } from './dto/get-scrapper-by-name-demo.dto';
import { ScrapperEmailRo } from './ro/scrapper-email.ro';
import { ScrapperFaceRo } from './ro/scrapper-face.ro';
import { ScrapperNameRo } from './ro/scrapper-name.ro';
import { ScrapperNameDemoRo } from './ro/scrapper-name-demo.ro';
import { ScrapperResumeRo } from './ro/scrapper-resume.ro';
import { ScrapperService } from './scrapper.service';

@ApiTags('scrapper')
@Controller('scrapper')
export class ScrapperController {
	constructor(private readonly scrapperService: ScrapperService) {}

	@ApiOperation({ summary: "Search user's information by name" })
	@ApiOkResponse({ description: 'Success', type: [ScrapperNameRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/name')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getByName(@CurrentUser() user: User): Promise<ScrapperName[]> {
		const payload: GetByNameRequest = { lastName: user.lastName, firstName: user.firstName, demo: false };

		return this.scrapperService.getByName(payload);
	}

	@ApiOperation({ summary: "Search limited user's information by name" })
	@ApiOkResponse({ description: 'Success', type: [ScrapperNameDemoRo] })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/demo')
	@HttpCode(HttpStatus.OK)
	async getByNameDemo(@Body() payload: GetScrapperByNameDemoDto): Promise<ScrapperName[]> {
		return this.scrapperService.getByName({ ...payload, demo: true });
	}

	@ApiOperation({ summary: "Search user's information by email" })
	@ApiOkResponse({ description: 'Success', type: [ScrapperEmailRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@Post('/email')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getByEmail(@CurrentUser() user: User): Promise<ScrapperEmail[]> {
		const payload: GetByEmailRequest = { email: user.email };

		return this.scrapperService.getByEmail(payload);
	}

	@ApiOperation({ summary: "Search user's information by resume" })
	@ApiConsumes('multipart/form-data')
	@ApiOkResponse({ description: 'Success', type: [ScrapperResumeRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@UseInterceptors(FileInterceptor('file'))
	@Post('/resume')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getByResume(
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					new FileTypeValidator({ fileType: 'pdf' }),
				],
			}),
		)
		file: Express.Multer.File,
	): Promise<ScrapperResume> {
		const payload: GetByResumeRequest = { fileName: file.originalname, fileContent: file.buffer };

		return this.scrapperService.getByResume(payload);
	}

	@ApiOperation({ summary: "Search user's information by face" })
	@ApiConsumes('multipart/form-data')
	@ApiOkResponse({ description: 'Success', type: [ScrapperFaceRo] })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiInternalServerErrorResponse({ description: 'Internal server error' })
	@UseInterceptors(FileInterceptor('file'))
	@Post('/face')
	@AuthUser()
	@HttpCode(HttpStatus.OK)
	async getByFace(
		@CurrentUser() user: User,
		@UploadedFile(
			new ParseFilePipe({
				validators: [
					new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
					// eslint-disable-next-line prefer-regex-literals
					new FileTypeValidator({ fileType: new RegExp(/\S+(.*?).(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/) }),
				],
			}),
		)
		file: Express.Multer.File,
	): Promise<ScrapperFace[]> {
		const payload: GetByFaceRequest = {
			lastName: user.lastName,
			firstName: user.firstName,
			fileName: file.originalname,
			fileContent: file.buffer,
		};

		return this.scrapperService.getByFace(payload);
	}
}
