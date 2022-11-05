import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
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
