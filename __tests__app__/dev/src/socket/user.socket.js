import { SocketClass } from '../../../../server';

export default class User extends SocketClass {

	variable = null;

	@SocketClass.requireAuth
	get(socket, data, next) {
		next(null, { id: 1, name: 'Test User' });
	}

	@SocketClass.broadcast()
	getPromise(socket) {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ id: 1, name: 'Test User' });
			}, 1000);
		});
	}

	async getAsyncError(socket) {
		// eslint-disable-next-line no-undef
		return a;
	}

	getSyncError(socket) {
		throw new Error('Error');
	}

	async getVoidPromise(socket) {
		// eslint-disable-next-line no-console
		console.log('VOID PROMISE');
	}

	getPayloadedError(socket, data, next) {
		next({ message: 'Test error', code: 'ERR_TEST', statusCode: 403 });
	}

	@SocketClass.notSocketMethod
	notEventMethod() {

	}

	_notEventMethod() {
		return null;
	}
}
