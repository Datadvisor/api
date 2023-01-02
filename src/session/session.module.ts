import { RedisService } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as RedisStore from 'connect-redis';
import * as session from 'express-session';
import { NestSessionOptions, SessionModule as NestSessionModule } from 'nestjs-session';

import { RedisModule } from '../redis/redis.module';

@Module({
	imports: [
		NestSessionModule.forRootAsync({
			imports: [RedisModule],
			inject: [ConfigService, RedisService],
			useFactory: (configService: ConfigService, redisService: RedisService): NestSessionOptions => {
				return {
					session: {
						store: new (RedisStore(session))({ client: redisService.getClient() }),
						name: 'API_SID',
						secret: configService.get<string>('api.session.secret'),
						resave: true,
						saveUninitialized: true,
						cookie: {
							secure: configService.get<boolean>('api.session.secure'),
							sameSite: false,
							httpOnly: configService.get<boolean>('api.session.httpOnly'),
							maxAge: configService.get<number>('api.session.maxAge'),
							domain: configService.get<string>('api.session.domain'),
						},
					},
				};
			},
		}),
	],
})
export class SessionModule {}
