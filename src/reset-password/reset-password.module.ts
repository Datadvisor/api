import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { EmailModule } from '../email';
import { UsersModule } from '../users';
import { ResetPasswordController } from './reset-password.controller';
import { ResetPasswordService } from './reset-password.service';

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				signOptions: {
					expiresIn: configService.get<string>('api.reset-password.jwtExpirationTime'),
				},
			}),
			inject: [ConfigService],
		}),
		EmailModule,
		UsersModule,
	],
	controllers: [ResetPasswordController],
	providers: [ResetPasswordService],
})
export class ResetPasswordModule {}
