import { SocketRequest, Type } from '../../../src/app';

export default class User extends SocketRequest {

	@SocketRequest.castResponse({
		id: Type.integer,
		name: Type.string,
	})
	get() {
		return this.execute('user.getPromise');
	}
}
