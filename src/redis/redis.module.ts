import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule, RedisModuleOptions, RedisService } from '@liaoliaots/nestjs-redis';

@Module({
	imports: [
		NestRedisModule.forRootAsync({
			useFactory: (configService: ConfigService): RedisModuleOptions => {
				const logger = new Logger(RedisService.name);

				return {
					config: {
						url: configService.get<string>('redis.url'),
						onClientCreated: (client) => {
							client.on('error', (err) => {
								logger.error(err);
							});
							client.on('ready', () => {
								logger.log('Redis successfully connected');
							});
						},
					},
				};
			},
			inject: [ConfigService],
		}),
	],
})
export class RedisModule {}
