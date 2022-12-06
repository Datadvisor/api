import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

import {
	GetByEmailRequest,
	GetByFaceRequest,
	GetByNameRequest,
	GetByResumeRequest,
	SCRAPPER_PACKAGE_NAME,
	SCRAPPER_SERVICE_NAME,
	ScrapperEmail,
	ScrapperFace,
	ScrapperName,
	ScrapperResume,
	ScrapperServiceClient,
} from '../protos/scrapper/scrapper';

@Injectable()
export class ScrapperService implements OnModuleInit {
	private scrapperServiceClient: ScrapperServiceClient;

	constructor(@Inject(SCRAPPER_PACKAGE_NAME) private client: ClientGrpc) {}

	onModuleInit() {
		this.scrapperServiceClient = this.client.getService<ScrapperServiceClient>(SCRAPPER_SERVICE_NAME);
	}

	async getByName(payload: GetByNameRequest): Promise<ScrapperName[]> {
		const res = await lastValueFrom(this.scrapperServiceClient.getByName(payload));

		return res.data || [];
	}

	async getByEmail(payload: GetByEmailRequest): Promise<ScrapperEmail[]> {
		const res = await lastValueFrom(this.scrapperServiceClient.getByEmail(payload));

		return res.data || [];
	}

	async getByResume(payload: GetByResumeRequest): Promise<ScrapperResume> {
		const res = await lastValueFrom(this.scrapperServiceClient.getByResume(payload));

		return res.data;
	}

	async getByFace(payload: GetByFaceRequest): Promise<ScrapperFace[]> {
		const res = await lastValueFrom(this.scrapperServiceClient.getByFace(payload));

		return res.data || [];
	}
}
