import { SocketClass } from '../../../server';

export default class User extends SocketClass {

	@SocketClass.requireAuth
	get(socket, data, next) {
		next(null, { id: 1, name: 'Test User' });
	}

	@SocketClass.broadcast()
	getPromise(socket) {
		return new Promise((resolve) => {
			resolve({ id: 1, name: 'Test User' });
		});
	}

	async getAsyncError(socket) {
		return a;
	}

	getSyncError(socket) {
		throw new Error('Error');
	}

	async getVoidPromise(socket) {
		console.log('VOID PROMISE');
	}

	getPayloadedError(socket, data, next) {
		next({ message: 'Test error', code: 'ERR_TEST', statusCode: 403 });
	}

	_notEventMethod() {
		return null;
	}
}
