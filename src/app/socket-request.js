/* eslint-disable func-names */
import uniqid from 'uniqid';
import Type from 'runtime-type';

import Application from './application';
import Socket from './socket';
import CallbackEmitter from './callback-emitter';

const TIMEOUT = 30000;

function castResponse(config = {}) {
	return function (target, name, descriptor) {
		const original = descriptor.value;
		if (typeof original === 'function') {
			// eslint-disable-next-line no-param-reassign
			descriptor.value = async function (...args) {
				const r = await original.apply(this, args);
				if (typeof r !== 'object') {
					return r;
				}
				if (r instanceof Array) {
					return r;
				}
				const out = {};
				Object.keys(r).forEach((key) => {
					const value = r[key];
					if (!config[key]) {
						if (Application.DEV) {
							console.warn(`Key '${key}' not defined.`);
						}
						out[key] = value;
						return;
					}
					if (!(config[key] instanceof Type.Type)) {
						if (Application.DEV) {
							console.error(`Type for '${key}' in the instance of the runtime-type.`);
						}
						return;
					}
					out[key] = config[key].cast(value);
				});
				return out;
			};
		}
		return descriptor;
	};
}

export default class SocketRequest extends CallbackEmitter {

	static castResponse = castResponse;

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

	clearListeners() {
		this._socketListeners.forEach(({ event, listener }, index) => {
			Socket.removeListener(event, listener);
			delete this._socketListeners[index];
		});
		this._requests = {};
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
