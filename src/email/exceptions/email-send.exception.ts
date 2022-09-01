export class EmailSendException extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmailSendException';
	}
}
