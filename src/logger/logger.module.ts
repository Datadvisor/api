import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { WinstonModule, utilities as WinstonModuleUtilities } from 'nest-winston';

const { transports, format } = winston;

export const Logger: DynamicModule = WinstonModule.forRootAsync({
	useFactory: (configService: ConfigService) => ({
		format: format.combine(format.timestamp(), WinstonModuleUtilities.format.nestLike('Nest')),
		transports: [
			new transports.Console({
				level: 'debug',
			}),
			new transports.File({
				level: 'info',
				filename: configService.get<string>('api.logs.combinedPath'),
				format: format.combine(format.timestamp(), format.uncolorize()),
			}),
			new transports.File({
				level: 'error',
				filename: configService.get<string>('api.logs.errorPath'),
				format: format.combine(format.timestamp(), format.uncolorize()),
			}),
		],
	}),
	inject: [ConfigService],
});
