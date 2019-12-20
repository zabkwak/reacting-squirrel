import { Model } from 'runtime-type';

import SocketRequest from './request';

export default class SocketModel extends Model {

	_socketRequest = null;

	constructor() {
		super();
		this._socketRequest = new SocketRequest();
	}

	_execute(event, data = null, timeout = undefined, onProgress = null) {
		return this._socketRequest.execute(event, data, timeout, onProgress);
	}
}
