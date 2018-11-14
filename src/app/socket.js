/** @module Socket */
import io from 'socket.io-client';

import CallbackEmitter from './callback-emitter';
import Application from './application';

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
    ];

    registerEvents(events) {
        this._events = this._events.concat(events);
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
        this._socket.on('disconnect', () => {
            if (Application.DEV) {
                console.log('Socket disconnected');
            }
            this._setState(this.STATE_DISCONNECTED);
        });
        this._events.forEach(event => this._socket.on(event, data => this._handleEvent(event, data)));
    }

    /**
     * Emits the data.
     *
     * @param {string} event
     * @param {any} data
     */
    emit(event, data) {
        if (!this.isConnected()) {
            throw new Error('Socket not connected');
        }
        if (this._events.indexOf(event) < 0) {
            console.warn(`Unknown socket event '${event}'`);
        }
        if (Application.DEV) {
            console.log(`Emit '${event}'`, data);
        }
        this._socket.emit(event, data);
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
}

export default new Socket();
