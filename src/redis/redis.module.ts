import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule as NestRedisModule, RedisModuleOptions } from '@liaoliaots/nestjs-redis';

@Module({
	imports: [
		NestRedisModule.forRootAsync({
			useFactory: (configService: ConfigService): RedisModuleOptions => {
				const logger = new Logger('RedisService');

				return {
					config: {
						host: configService.get<string>('redis.host'),
						port: configService.get<number>('redis.port'),
						password: configService.get<string>('redis.password'),
						onClientCreated(redis) {
							redis.on('error', (err) => {
								logger.error(err);
							});
							redis.on('ready', () => {
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
