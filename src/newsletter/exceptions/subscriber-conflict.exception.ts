export class SubscriberConflictException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'SubscriberConflictException';
	}
}
