import { OmitType } from '@nestjs/swagger';

import { CreateUserDto } from '../../users/dto';

export class ResetPasswordDto extends OmitType(CreateUserDto, [
	'lastName',
	'firstName',
	'email',
	'newsletter',
] as const) {}
