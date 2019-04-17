import { SocketClass } from '../../../server';

export default class User extends SocketClass {

    get(socket, data, next) {
        next(null, { id: 1, name: 'Test User' });
    }

    getPromise(session) {
        return new Promise((resolve) => {
            resolve({ id: 1, name: 'Test User' });
        });
    }

    async getAsyncError(session) {
        return a;
    }

    getSyncError(session) {
        throw new Error('Error');
    }
}
