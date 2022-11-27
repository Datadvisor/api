import { ApiProperty } from '@nestjs/swagger';

import { ScrapperMetadata } from '../../protos/scrapper/scrapper';

export class ScrapperNameDemoRo {
	@ApiProperty()
	name: string;

	@ApiProperty()
	link: string;

	@ApiProperty()
	found: boolean;

	@ApiProperty()
	metadata: ScrapperMetadata[];
}
