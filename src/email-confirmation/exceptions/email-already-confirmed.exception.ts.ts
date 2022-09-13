export class EmailAlreadyConfirmedException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'EmailAlreadyConfirmedException';
	}
}
