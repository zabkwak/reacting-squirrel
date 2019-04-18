import { SocketClass } from '../../../server';

export default class User extends SocketClass {

    get(socket, data, next) {
        next(null, { id: 1, name: 'Test User' });
    }

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
}
