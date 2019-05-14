import socketIO from 'socket.io';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import uniqid from 'uniqid';
import SmartError from 'smart-error';
// import { encode, decode } from '@msgpack/msgpack';
import { decode } from 'msgpack-lite';

/**
 * @typedef {import('./').default} Server
 * @typedef {import('./session').default} Session
 * @typedef {import('./socket-class').default} SocketClass
 * @typedef SocketEvent
 * @property {string} event
 * @property {function(any, function):void|Promise<any>} listener
 */

class Socket {

    /** @type {Socket[]} */
    static _sockets = [];

    static _listeners = {};

    static _chunks = {};

    /**
     *
     * @param {socketIO.Socket} socket
     * @param {SocketEvent[]} events
     * @param {SocketClass[]} classes
     */
    static add(socket, events, classes) {
        const s = new this(socket);
        this._sockets.push(s);
        /*
        socket.use((packet, next) => {
            console.log(packet);
            next();
        });
        */
        s.on('error', (err) => {
            console.error(err);
            this._callListener('error', s, err);
        });
        s.on('disconnect', (reason) => {
            this._sockets.splice(this._sockets.indexOf(s), 1);
            this._callListener('disconnect', s, reason);
        });
        events.forEach(({ event, listener }) => {
            s.on(event, (message = {}) => {
                let sent;
                // TODO limit size of data
                const {
                    key, size, index, byteLength,
                } = message;
                if (!this._chunks[key]) {
                    this._chunks[key] = [];
                }
                this._chunks[key][index] = Buffer.from(Object.keys(message.data).map(k => message.data[k]));
                const chunks = this._chunks[key];
                s.emit(`${key}~progress`, { total: size, done: chunks.length });
                if (chunks.length === size) {
                    const data = decode(Buffer.concat(chunks));
                    const handle = (err, data) => {
                        const response = {};
                        if (err) {
                            if (!(err instanceof SmartError)) {
                                const { message, code, ...payload } = err;
                                err = new SmartError(message, code, SmartError.parsePayload(payload));
                            }
                            response.error = err.toJSON();
                        } else {
                            response.data = data;
                        }
                        response._key = key;
                        s.emit(event, response);
                    };
                    try {
                        const p = listener(s, data, (err, data) => {
                            if (sent) {
                                console.warn('Data already sent using Promise.');
                                return;
                            }
                            sent = true;
                            handle(err, data);
                        });
                        if (!(p instanceof Promise)) {
                            return;
                        }
                        p.then((data) => {
                            if (sent) {
                                console.warn('Data already sent using callback.');
                                return;
                            }
                            sent = true;
                            handle(null, data === null ? undefined : data);
                        }).catch((err) => {
                            if (sent) {
                                console.warn('Data already sent using callback.');
                                return;
                            }
                            sent = true;
                            handle(err);
                        });
                    } catch (e) {
                        sent = true;
                        handle(e);
                    }
                }
            });
        });
        this._callListener('connection', s);
    }

    static on(event, listener) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(listener);
    }

    /**
     * Broadcasts the event to all connected sockets which will pass the filter method.
     *
     * @param {string} event Name of the event to broadcast.
     * @param {any} data Data to broadcast.
     * @param {boolean} includeSelf If true the data are broadcasting also to the requesting socket.
     * @param {function(Socket):boolean} filter Filter function to validate sockets.
     */
    static broadcast(event, data, filter = socket => true) {
        this.iterateSockets((socket) => {
            if (!filter(socket)) {
                return;
            }
            socket.emit(event, data);
        });
    }

    /**
     *
     * @param {function(Socket):void} iterator
     */
    static iterateSockets(iterator) {
        this._sockets.forEach(iterator);
    }

    static _callListener(event, socket, ...args) {
        if (!this._listeners[event]) {
            return;
        }
        this._listeners[event].forEach((listener) => {
            if (typeof listener === 'function') {
                listener(socket, ...args);
            }
        });
    }

    /** @type {socketIO.Socket} */
    _socket = null;

    /** @type {string} */
    _id = null;

    /**
     *
     * @param {socketIO.Socket} socket
     */
    constructor(socket) {
        this._socket = socket;
        this._id = uniqid();
        this.on('handshake', () => this.emit('handshake'));
    }

    emit(event, data) {
        this._socket.emit(event, data);
    }

    on(event, listener) {
        this._socket.on(event, listener);
    }

    /**
     * @returns {Session}
     */
    getSession() {
        return this._socket.session;
    }

    /**
     * Broadcasts the event to all connected sockets which will pass the filter method.
     *
     * @param {string} event Name of the event to broadcast.
     * @param {any} data Data to broadcast.
     * @param {boolean} includeSelf If true the data are broadcasting also to the requesting socket.
     * @param {function(Socket):boolean} filter Filter function to validate sockets.
     */
    broadcast(event, data, includeSelf = false, filter = socket => true) {
        Socket.iterateSockets((socket) => {
            if (!includeSelf && socket === this) {
                return;
            }
            if (!filter(socket)) {
                return;
            }
            socket.emit(event, data);
        });
    }
}

/**
 *
 * @param {Server} server Server instance.
 */
const func = (server, options = {}) => {
    const io = socketIO(server.getServer(), options);
    const { cookieSecret } = server._config;
    io.use((socket, next) => {
        if (!socket.request.headers.cookie) {
            next();
            return;
        }
        const cookies = cookie.parse(socket.request.headers.cookie);
        if (!cookies.session_id) {
            next(new Error('Session id not created'));
            return;
        }
        const sessionId = cookieSignature.unsign(cookies.session_id, cookieSecret);
        if (!sessionId) {
            next(new Error('Session id not created'));
            return;
        }
        socket.session = new server.Session(sessionId);
        server.auth(socket.session, next);
    });

    io.on('connection', (socket) => {
        Socket.add(socket, server.getSocketEvents(), server.getSocketClasses());
    });

    io.on('error', err => console.error(err));
};

export {
    func as default,
    Socket,
};
