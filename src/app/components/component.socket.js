import Component from './component';
import SocketRequest from '../socket/request';

const TIMEOUT = 30000;

export default class SocketComponent extends Component {

	_requests = {};

	_socketListeners = [];

	_queue = [];

	_socketRequest = new SocketRequest();

	// eslint-disable-next-line react/sort-comp
	__state__ = (socket, state) => {
		this.onSocketStateChanged(state);
	};

	__error__ = (socket, error) => this.onSocketError(error);

	componentDidMount() {
		super.componentDidMount();
		this._socketRequest
			.addListener('state', this.__state__)
			.addListener('error', this.__error__);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this._socketRequest
			.removeListener('state', this.__state__)
			.removeListener('error', this.__error__)
			.clearListeners();
	}

	onSocketStateChanged(state) { }

	onSocketError(error) { }

	on(event, callback) {
		this._socketRequest.on(event, callback);
		return this;
	}

	call(event, data = {}, timeout = TIMEOUT, onProgress = null) {
		this.getContext().logWarning('SocketComponent.call is deprecated. Use requestAsync instead.');
		return this.requestAsync(event, data, timeout, onProgress);
	}

	requestAsync(event, data = {}, timeout = TIMEOUT, onProgress = null) {
		return this._socketRequest.execute(event, data, timeout, onProgress);
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
		this.getContext().logWarning('SocketComponent.request is deprecated. Use requestAsync instead.');
		if (typeof data === 'function') {
			// eslint-disable-next-line no-param-reassign
			callback = data;
			// eslint-disable-next-line no-param-reassign
			timeout = TIMEOUT;
			// eslint-disable-next-line no-param-reassign
			data = {};
		}
		if (typeof timeout === 'function') {
			// eslint-disable-next-line no-param-reassign
			callback = timeout;
			// eslint-disable-next-line no-param-reassign
			timeout = TIMEOUT;
		}
		if (typeof callback !== 'function') {
			this.getContext().logError('No callback for socket request');
			return this;
		}
		if (!data) {
			// eslint-disable-next-line no-param-reassign
			data = {};
		}
		this._socketRequest
			.execute(event, data, timeout, onProgress)
			.then((d) => process.nextTick(() => callback(null, d)))
			.catch((e) => process.nextTick(() => callback(e)));
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
		this._socketRequest.emit(event, key, data, onProgress);
		return this;
	}
}
