export class UserConflictException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'UserConflictException';
	}
}
