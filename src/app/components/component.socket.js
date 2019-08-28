import uniqid from 'uniqid';

import Component from './component';
import Socket from '../socket';

const TIMEOUT = 30000;

export default class SocketComponent extends Component {

	_requests = {};

	_socketListeners = [];

	_queue = [];

	__state__ = (socket, state) => {
		if (state === 'connected') {
			this._executeQueue();
		}
		this.onSocketStateChanged(state);
	};

	__error__ = (socket, error) => this.onSocketError(error);

	componentDidMount() {
		super.componentDidMount();
		Socket
			.addListener('state', this.__state__)
			.addListener('error', this.__error__);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		Socket
			.removeListener('state', this.__state__)
			.removeListener('error', this.__error__);
		this._socketListeners.forEach(({ event, listener }, index) => {
			Socket.removeListener(event, listener);
			delete this._socketListeners[index];
		});
	}

	onSocketStateChanged(state) { }

	onSocketError(error) { }

	on(event, callback) {
		const listener = (socket, data) => callback(data.error, data.data);
		this._socketListeners.push({ event, listener });
		Socket.addListener(event, listener);
		return this;
	}

	call(event, data = {}, timeout = TIMEOUT, onProgress = null) {
		if (this.getContext().DEV) {
			console.warn('SocketComponent.call is deprecated. Use requestAsync instead.');
		}
		return this.requestAsync(event, data, timeout, onProgress);
	}

	requestAsync(event, data = {}, timeout = TIMEOUT, onProgress = null) {
		return new Promise((resolve, reject) => {
			this.request(event, data, timeout, (err, response) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(response);
			}, onProgress);
		});
	}

	/**
	 * Requests the data over the socket. It automatically handles listeners on the Socket class and calls the callback.
	 *
	 * @param {string} event Name of the event.
	 * @param {Object.<string, object>|function} data Data to emit or the callback.
	 * @param {number|function} timeout Timeout in milliseconds or the callback.
	 * @param {function} callback Callback is called after the socket execution.
	 * @param {function} onProgress Function called in the progress of the request.
	 */
	request(event, data, timeout, callback, onProgress) {
		if (typeof data === 'function') {
			callback = data;
			timeout = TIMEOUT;
			data = {};
		}
		if (typeof timeout === 'function') {
			callback = timeout;
			timeout = TIMEOUT;
		}
		if (typeof callback !== 'function') {
			console.error('No callback for socket request');
			return this;
		}
		if (!data) {
			data = {};
		}
		const key = uniqid();
		let done = false;
		const start = Date.now();
		const listener = (socket, data) => {
			if (this.getContext().DEV) {
				console.log(`Request ${event}`, { took: Date.now() - start, _key: data._key });
			}
			done = true;
			if (data && data._key === key) {
				callback(data.error, data.data);
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
		return this;
	}

	/**
	 * Emits the socket event with data. The event is sent after the socket is connected => this method can be called before the socket connection.
	 *
	 * @param {string} event Name of the event.
	 * @param {string} key Key of the request.
	 * @param {Object.<string, object>} [data] Data to emit.
	 * @param {function} onProgress Function called in the progress of the request.
	 */
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
