import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Role, User } from '../entities/user.entity';

export class UserRo {
	constructor(partial: Partial<User>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: string;

	@ApiProperty()
	lastName: string;

	@ApiProperty()
	firstName: string;

	@ApiProperty()
	email: string;

	@ApiProperty()
	emailVerified: boolean;

	@Exclude()
	password: string;

	@ApiProperty({ enum: Role })
	role: Role;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty()
	createdAt: Date;
}
