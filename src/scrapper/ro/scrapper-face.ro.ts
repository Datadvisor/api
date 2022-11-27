import { ApiProperty } from '@nestjs/swagger';

import { ScrapperMetadata } from '../../protos/scrapper/scrapper';

export class ScrapperFaceRo {
	@ApiProperty()
	link: string;

	@ApiProperty()
	metadata: ScrapperMetadata[];
}
