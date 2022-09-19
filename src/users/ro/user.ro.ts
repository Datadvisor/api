import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { User, Role } from '../entities';

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

	@Exclude()
	password: string;

	@ApiProperty({ enum: Role })
	role: Role;

	@ApiProperty()
	updatedAt: Date;

	@ApiProperty()
	createdAt: Date;
}
