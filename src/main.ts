import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);

	const corsOrigins = configService.get<string[]>('api.cors.origins');

	app.enableCors({ credentials: true, allowedHeaders: '*', origin: corsOrigins });

	app.useGlobalPipes(new ValidationPipe({ transform: true }));

	const host = configService.get<string>('api.host');
	const port = configService.get<number>('api.port');

	await app.listen(port, host);
}

void bootstrap();
