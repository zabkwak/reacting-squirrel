import uniqid from 'uniqid';

import Component from './component';
import Socket from './socket';

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

    componentDidMount() {
        super.componentDidMount();
        Socket.addListener('state', this.__state__);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        Socket.removeListener('state', this.__state__);
        this._socketListeners.forEach((k) => {
            const { event, listener } = this._socketListeners[k];
            Socket.removeListener(event, listener);
            delete this._socketListeners[k];
        });
    }

    onSocketStateChanged(state) { }

    on(event, callback) {
        const listener = (socket, data) => callback(data.error, data.data);
        this._socketListeners.push({ event, listener });
        Socket.addListener(event, listener);
    }

    /**
     * Requests the data over the socket. It automatically handles listeners on the Socket class and calls the callback.
     *
     * @param {string} event Name of the event.
     * @param {Object.<string, object>|function} data Data to emit or the callback.
     * @param {number|function} timeout Timeout in milliseconds or the callback.
     * @param {function} callback Callback is called after the socket execution.
     */
    request(event, data, timeout, callback) {
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
        data._key = key;
        let done = false;
        const listener = (socket, data) => {
            done = true;
            if (data && data._key === key) {
                callback(data.error, data.data);
            }
            Socket.removeListener(event, listener);
            delete this._requests[key];
        };
        Socket.addListener(event, listener);
        this.emit(event, data);
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
     * @param {Object.<string, object>} [data] Data to emit.
     */
    emit(event, data = {}) {
        if (!Socket.isConnected()) {
            this._queue.push({ event, data });
            return this;
        }
        Socket.emit(event, data);
        return this;
    }

    _executeQueue() {
        while (this._queue.length) {
            const item = this._queue.shift();
            Socket.emit(item.event, item.data);
        }
    }
}
