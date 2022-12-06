import { ApiProperty } from '@nestjs/swagger';

export class ScrapperResumeRo {
	@ApiProperty()
	emails: string[];

	@ApiProperty()
	cities: string[];

	@ApiProperty()
	addresses: string[];

	@ApiProperty()
	phones: string[];

	@ApiProperty()
	urls: string[];
}
