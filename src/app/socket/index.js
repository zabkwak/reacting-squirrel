/** @module Socket */
import io from 'socket.io-client';
import { encode } from 'msgpack-lite';
import uniqid from 'uniqid';

import CallbackEmitter from '../callback-emitter';
import Application from '../application';

/**
 * Class to handle communication with the server app using websockets.
 */
class Socket extends CallbackEmitter {

	/**
	 * The socket is not initiated.
	 */
	STATE_NONE = 'none';

	/**
	 * The socket is connecting to the server.
	 */
	STATE_CONNECTING = 'connecting';

	/**
	 * The socket is connected to the server.
	 */
	STATE_CONNECTED = 'connected';

	/**
	 * The socket is disconnected from the server.
	 */
	STATE_DISCONNECTED = 'disconnected';

	_socket = null;

	_state = 'none';

	_events = [
		'handshake',
		'webpack.stats',
	];

	_chunkSize = (2 ** 10) * 10;

	_maxMessageSize = (2 ** 20) * 10;

	setChunkSize(chunkSize) {
		this._chunkSize = chunkSize;
		return this;
	}

	setMaxMessageSize(maxMessageSize) {
		this._maxMessageSize = maxMessageSize;
		return this;
	}

	registerEvents(events) {
		this._events = this._events.concat(events);
		if (Application.DEV) {
			console.log('Registered socket evens', events);
		}
		return this;
	}

	/**
	 * Connects the socket to the server. This method can be called only once. If the server disconnects the socket the socket is automatically reconnected when it's posiible.
	 *
	 * @param {string} address Address of the socket server.
	 */
	connect(address = undefined) {
		if (this._state !== this.STATE_NONE) {
			throw new Error('Socket already connected');
		}
		this._setState(this.STATE_CONNECTING);
		this._socket = io(address);
		this._socket.on('connect', () => {
			if (Application.DEV) {
				console.log('Socket connected');
			}
			this._setState(this.STATE_CONNECTED);
		});
		this._socket.on('reconnect', () => {
			if (Application.DEV) {
				console.log('Socket reconnected');
			}
		});
		this._socket.on('disconnect', (reason) => {
			if (Application.DEV) {
				console.log('Socket disconnected', reason);
			}
			this._setState(this.STATE_DISCONNECTED);
		});
		this._socket.on('error', (err) => {
			if (Application.DEV) {
				console.error('Socket connection error', err);
			}
			this._callListener('error', err);
		});
		this._events.forEach((event) => this._socket.on(event, (data) => this._handleEvent(event, data)));
	}

	/**
	 * Emits the data.
	 *
	 * @param {string} event
	 * @param {string} key
	 * @param {any} data
	 * @param {function} onProgress
	 */
	emit(event, key = uniqid(), data = {}, onProgress = null) {
		if (!this.isConnected()) {
			throw new Error('Socket not connected');
		}
		if (this._events.indexOf(event) < 0) {
			console.warn(`Unknown socket event '${event}'`);
		}
		this._emit(event, key, data, onProgress)
			.catch((e) => {
				// Force to handle event as error
				const [handle] = this._socket._callbacks[`$${event}`];
				handle({ error: e, _key: key });
			});
		return this;
	}

	/**
	 * Disconnects the socket.
	 */
	disconnect() {
		this._socket.disconnect();
	}

	/**
	 * Gets the current state of the socket.
	 */
	getState() {
		return this._state;
	}

	/**
	 * Checks if socket is in connected state.
	 */
	isConnected() {
		return this._state === this.STATE_CONNECTED;
	}

	/**
	 * Sets the state of the socket and calls 'state' event of CallbackEmitter.
	 * @param {*} state
	 */
	_setState(state) {
		this._state = state;
		this._callListener('state', state);
	}

	async _emit(event, key, data, onProgress) {
		data = await this._convertData(data);
		if (Application.DEV) {
			console.log(`Emit '${event}'`, data);
		}
		const bin = encode(data);
		const { byteLength } = bin;
		if (byteLength > this._maxMessageSize) {
			throw new Error('Overcomed allowed size of the message.');
		}
		const chunked = this._chunkArray(bin, this._chunkSize);
		const size = chunked.length;
		this._socket.on(`${key}~progress`, ({ done, total }) => {
			if (typeof onProgress === 'function') {
				onProgress(done / total);
			}
		});
		chunked.forEach((chunk, index) => {
			this._socket.emit(event, {
				key,
				byteLength,
				size,
				index,
				data: chunk,
			});
		});
	}

	async _convertData(data) {
		await Promise.all(Object.keys(data).map(async (key) => {
			const value = data[key];
			if (value instanceof File) {
				const buffer = await this._convertFileToArrayBuffer(value);
				data[key] = new Uint8Array(buffer);
				return;
			}
			if (typeof value === 'object') {
				if (value === null) {
					return;
				}
				if (value === undefined) {
					return;
				}
				data[key] = await this._convertData(value);
			}
			if (value === undefined) {
				delete data[key];
			}
		}));
		return data;
	}

	_handleEvent(event, data) {
		if (Application.DEV) {
			console.log(`Handling event '${event}'`, data);
		}
		if (data && data.error && Application.DEV) {
			console.error('Socket error', data.error);
		}
		if (data && data._deprecated && Application.DEV) {
			console.warn(`Event '${event}' is deprecated`);
		}
		this._callListener(event, data);
	}

	_chunkArray(array, chunkSize) {
		const arrayLength = array.length;
		const tempArray = [];
		for (let index = 0; index < arrayLength; index += chunkSize) {
			const myChunk = array.slice(index, index + chunkSize);
			tempArray.push(myChunk);
		}
		return tempArray;
	}

	_convertFileToArrayBuffer(file) {
		return new Promise((resolve, reject) => {
			const fr = new FileReader();
			fr.onload = () => resolve(fr.result);
			fr.onerror = (e) => reject(e);
			fr.readAsArrayBuffer(file);
		});
	}
}

export default new Socket();
