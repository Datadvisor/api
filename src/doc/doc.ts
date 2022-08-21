import { DocumentBuilder } from '@nestjs/swagger';

export default new DocumentBuilder()
	.setTitle('Datadvisor API')
	.setDescription('API Documentation for Datadvisor')
	.setVersion('1.0.0')
	.build();
