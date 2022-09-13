import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { EmailModule } from '../email';
import { UsersModule } from '../users';
import { EmailConfirmationController } from './email-confirmation.controller';
import { EmailConfirmationService } from './email-confirmation.service';

@Module({
	imports: [
		JwtModule.registerAsync({
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('api.email-confirmation.jwtSecret'),
				signOptions: {
					expiresIn: configService.get<string>('api.email-confirmation.jwtExpirationTime'),
				},
			}),
			inject: [ConfigService],
		}),
		EmailModule,
		forwardRef(() => UsersModule),
	],
	controllers: [EmailConfirmationController],
	providers: [EmailConfirmationService],
	exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
