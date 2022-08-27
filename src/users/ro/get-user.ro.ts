import { ApiProperty } from '@nestjs/swagger';

import { User, Role } from '../entities';
import { Exclude } from 'class-transformer';

export class GetUserRo {
	constructor(partial: Partial<User> = {}) {
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

	@Exclude()
	updatedAt: Date;

	@ApiProperty()
	createdAt: Date;
}
