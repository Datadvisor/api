import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { doc } from './doc/doc';
import { PostgresService } from './postgres/postgres.service';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const postgresService = app.get(PostgresService);

	app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

	const requestLogger = new Logger('Request');
	app.use(
		morgan('tiny', {
			stream: {
				write: (msg) => requestLogger.verbose(msg.trimEnd()),
			},
		}),
	);

	await postgresService.enableShutdownHooks(app);

	const corsHeaders = configService.get<string[]>('api.cors.headers');
	const corsOrigins = configService.get<string[]>('api.cors.origins');

	app.enableCors({ credentials: true, allowedHeaders: corsHeaders, origin: corsOrigins });

	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	SwaggerModule.setup('doc', app, SwaggerModule.createDocument(app, doc));

	const host = configService.get<string>('api.host');
	const port = configService.get<number>('api.port');

	const appLogger = new Logger('Main');

	await app.listen(port, host, () => {
		appLogger.verbose(`Allowed CORS headers: ${corsHeaders}`);
		appLogger.verbose(`Allowed CORS origins: ${corsOrigins}`);
		appLogger.log(`Server listening on http://${host}:${port}`);
	});
}

bootstrap();
