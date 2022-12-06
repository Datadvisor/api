import { ApiProperty } from '@nestjs/swagger';

export class ScrapperEmailRo {
	@ApiProperty()
	has_password: boolean;

	@ApiProperty()
	password: string;

	@ApiProperty()
	sha1: string;

	@ApiProperty()
	hash: string;

	@ApiProperty()
	sources: string[];
}
