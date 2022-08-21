import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as morgan from 'morgan';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

	const requestLogger = new Logger('Request');
	app.use(
		morgan('tiny', {
			stream: {
				write: (msg) => requestLogger.verbose(msg.trimEnd()),
			},
		}),
	);

	const corsHeaders = configService.get<string[]>('api.cors.headers');
	const corsOrigins = configService.get<string[]>('api.cors.origins');

	app.enableCors({ credentials: true, allowedHeaders: corsHeaders, origin: corsOrigins });

	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	const host = configService.get<string>('api.host');
	const port = configService.get<number>('api.port');

	const appLogger = new Logger('Main');

	await app.listen(port, host, () => {
		appLogger.verbose(`Allowed CORS headers: ${corsHeaders}`);
		appLogger.verbose(`Allowed CORS origins: ${corsOrigins}`);
		appLogger.log(`Server listening on http://${host}:${port}`);
	});
}

void bootstrap();
