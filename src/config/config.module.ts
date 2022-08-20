import { ConfigModule } from '@nestjs/config';
import { DynamicModule } from '@nestjs/common';

import apiConfig from './api.config';

export const Config: DynamicModule = ConfigModule.forRoot({
	cache: true,
	load: [apiConfig],
});
