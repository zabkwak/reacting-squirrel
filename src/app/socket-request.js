import uniqid from 'uniqid';
import Application from './application';
import Socket from './socket';
import CallbackEmitter from './callback-emitter';

const TIMEOUT = 30000;

export default class SocketRequest extends CallbackEmitter {

	_requests = {};

	_socketListeners = [];

	_queue = [];

	__state__ = (socket, state) => {
		if (state === 'connected') {
			this._executeQueue();
		}
		this._callListener('state', state);
	};

	__error__ = (socket, error) => {
		this._callListener('error', error);
	};

	constructor() {
		super();
		Socket
			.addListener('state', this.__state__)
			.addListener('error', this.__error__);
	}

	on(event, callback) {
		const listener = (socket, data) => callback(data.error, data.data);
		this._socketListeners.push({ event, listener });
		Socket.addListener(event, listener);
		return this;
	}

	execute(event, data = null, timeout = TIMEOUT, onProgress = null) {
		return new Promise((resolve, reject) => {
			if (!data) {
				data = {};
			}
			const key = uniqid();
			let done = false;
			const start = Date.now();
			const listener = (socket, data) => {
				if (Application.DEV) {
					console.log(`Request ${event}`, { took: Date.now() - start, _key: data._key });
				}
				done = true;
				if (data && data._key === key) {
					if (data.error) {
						reject(data.error);
					} else {
						resolve(data.data);
					}
					Socket.removeListener(event, listener);
					delete this._requests[key];
				}
			};
			Socket.addListener(event, listener);
			this.emit(event, key, data, onProgress);
			setTimeout(() => {
				if (done) {
					return;
				}
				if (!this._requests[key]) {
					return;
				}
				listener(Socket, { error: { message: `The request '${event}' timed out.`, code: 'ERR_TIMEOUT' }, _key: key });
			}, timeout);
			this._requests[key] = { event, listener };
			this._socketListeners.push({ event, listener });
		});
	}

	emit(event, key, data = {}, onProgress = null) {
		if (!Socket.isConnected()) {
			this._queue.push({
				event, key, data, onProgress,
			});
			return this;
		}
		Socket.emit(event, key, data, onProgress);
		return this;
	}

	_executeQueue() {
		while (this._queue.length) {
			const item = this._queue.shift();
			this.emit(item.event, item.key, item.data, item.onProgress);
		}
	}
}
