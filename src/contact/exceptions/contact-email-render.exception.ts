export class ContactEmailRenderException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'ContactEmailRenderException';
	}
}
