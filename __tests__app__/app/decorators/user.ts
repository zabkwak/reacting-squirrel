import { SocketRequest, Type } from '../../../src/app';

export default class User extends SocketRequest {

	@SocketRequest.castResponse({
		id: Type.integer,
		name: Type.string,
	})
	public get(): Promise<{ id: number, name: string }> {
		return this.execute('user.getPromise');
	}
}
