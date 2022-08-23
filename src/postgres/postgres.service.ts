import { INestApplication, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime';

@Injectable()
export class PostgresService
	extends PrismaClient<PrismaClientOptions, 'info' | 'warn' | 'error'>
	implements OnModuleInit
{
	private readonly logger = new Logger(PostgresService.name);

	constructor(private readonly configService: ConfigService) {
		super({
			datasources: {
				db: {
					url: configService.get<string>('postgres.url'),
				},
			},
			log: [
				{
					emit: 'event',
					level: 'error',
				},
				{
					emit: 'event',
					level: 'warn',
				},
				{
					emit: 'event',
					level: 'info',
				},
			],
		});
	}

	async onModuleInit(): Promise<void> {
		this.$on('error', (event) => {
			this.logger.error(event.target);
		});
		this.$on('warn', (event) => {
			this.logger.warn(event.target);
		});
		this.$on('info', (event) => {
			this.logger.log(event.target);
		});
		await this.$connect();
		this.logger.log('Postgres successfully connected');
	}

	async enableShutdownHooks(app: INestApplication): Promise<void> {
		this.$on('beforeExit', async () => {
			await app.close();
		});
	}
}
