import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import * as cron from 'node-cron';

import { EmailService } from '../email/email.service';
import { ScrapperService } from '../scrapper/scrapper.service';
import { Frequency, Scrapper, User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { relativeOrAbsolutePath } from '../utils/utils';

@Injectable()
export class WorkerService {
	private readonly logger = new Logger(WorkerService.name);

	constructor(
		private readonly configService: ConfigService,
		private readonly emailService: EmailService,
		private readonly scrapperService: ScrapperService,
		private readonly userService: UsersService,
	) {}

	async startMonthlyWorker(): Promise<void> {
		cron.schedule(this.configService.get<string>('api.worker.activitiesReport.monthlyCronSchedule'), async () => {
			const users = await this.userService.getAll();

			users.map(async (user) => {
				const preferences = await this.userService.getPreferences(user.id);

				if (!preferences.activitiesReport) {
					return;
				}
				await this.sendActivitiesReport(user, preferences.activitiesReportScrapper);
			});
			this.logger.log('Activities reports successfully sent.');
		});
	}

	async startBiMonthlyWorker(): Promise<void> {
		cron.schedule(this.configService.get<string>('api.worker.activitiesReport.bimonthlyCronSchedule'), async () => {
			const users = await this.userService.getAll();

			users.map(async (user) => {
				const preferences = await this.userService.getPreferences(user.id);

				if (!preferences.activitiesReport || preferences.activitiesReportFrequency !== Frequency.BI_MONTHLY) {
					return;
				}
				await this.sendActivitiesReport(user, preferences.activitiesReportScrapper);
			});
		});
	}

	private async sendActivitiesReport(user: User, scrapper: Scrapper) {
		let res;

		if (scrapper === Scrapper.NAME) {
			res = await this.scrapperService.getByName({
				lastName: user.lastName,
				firstName: user.firstName,
				demo: false,
			});
		} else if (scrapper === Scrapper.EMAIL) {
			res = await this.scrapperService.getByEmail({
				email: user.email,
			});
		}

		const html = await ejs.renderFile(
			relativeOrAbsolutePath(
				__dirname,
				this.configService.get<string>('api.worker.activitiesReport.emailTemplatePath'),
			),
		);

		await this.emailService.send({
			from: {
				name: this.configService.get<string>('api.email.senderName'),
				email: this.configService.get<string>('api.email.senderEmail'),
			},
			to: user.email,
			subject: 'Datadvisor - Activities Report',
			html,
			attachments: [
				{
					content: Buffer.from(JSON.stringify(res, null, 2), 'utf-8').toString('base64'),
					filename: `Report-${user.firstName}.${user.lastName}-${new Date().toLocaleDateString()}.json`,
					type: 'application/json',
					disposition: 'attachment',
				},
			],
		});
	}
}
