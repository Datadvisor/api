export class AuthUnauthorizedException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'AuthUnauthorizedException';
	}
}
