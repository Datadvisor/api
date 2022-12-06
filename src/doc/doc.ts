import { DocumentBuilder } from '@nestjs/swagger';

export const doc = new DocumentBuilder()
	.setTitle('Datadvisor API')
	.setDescription('API Documentation for Datadvisor')
	.setVersion('1.0.0')
	.addTag('auth', 'Auth module')
	.addTag('contact', 'Contact module')
	.addTag('email-confirmation', 'Email confirmation module')
	.addTag('reset-password', 'Reset password module')
	.addTag('scrapper', 'Scrapper module')
	.addTag('users', 'Users module')
	.build();
