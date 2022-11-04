export class SubscriberNotFoundException extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'SubscriberNotFoundException';
	}
}
