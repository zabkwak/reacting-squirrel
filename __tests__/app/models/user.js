import { SocketModel, Type } from '../../../src/app';

export default class UserModel extends SocketModel {

	@SocketModel.type(Type.string)
	id;

	async load() {
		this.setData(
			await this._execute('user.getPromise'),
		);
	}
}
