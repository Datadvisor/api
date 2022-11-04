import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

import { Preferences } from '../entities';

export class UserPreferencesRo {
	constructor(partial: Partial<Preferences>) {
		Object.assign(this, partial);
	}

	@ApiProperty()
	id: string;

	@ApiProperty()
	newsletter: boolean;

	@Exclude()
	userId: string;
}
