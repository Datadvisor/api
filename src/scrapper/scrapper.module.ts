import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpcProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

import { AuthModule } from '../auth/auth.module';
import { SCRAPPER_PACKAGE_NAME } from '../protos/scrapper/scrapper';
import { UsersModule } from '../users/users.module';
import { ScrapperController } from './scrapper.controller';
import { ScrapperService } from './scrapper.service';

@Module({
	imports: [AuthModule, UsersModule],
	controllers: [ScrapperController],
	providers: [
		ScrapperService,
		{
			provide: SCRAPPER_PACKAGE_NAME,
			useFactory: (configService: ConfigService): ClientGrpcProxy => {
				return ClientProxyFactory.create({
					transport: Transport.GRPC,
					options: {
						package: 'scrapper',
						protoPath: `${__dirname}/../../protos/scrapper.proto`,
						url: configService.get<string>('scrapper.url'),
					},
				});
			},
			inject: [ConfigService],
		},
	],
})
export class ScrapperModule {}
