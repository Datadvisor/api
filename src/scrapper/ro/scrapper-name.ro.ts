import { ApiProperty } from '@nestjs/swagger';

import { ScrapperMetadata } from '../../protos/scrapper/scrapper';

export class ScrapperNameRo {
	@ApiProperty()
	name: string;

	@ApiProperty()
	link: string;

	@ApiProperty()
	found: boolean;

	@ApiProperty()
	metadata: ScrapperMetadata[];
}
