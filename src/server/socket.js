import socketIO from 'socket.io';
import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import uniqid from 'uniqid';

class Socket {

    /** @type {Socket} */
    static _sockets = [];

    static add(socket, events, classes) {
        const s = new this(socket);
        this._sockets.push(s);
        s.on('error', err => console.error(err));
        s.on('disconnect', () => {
            this._sockets.splice(this._sockets.indexOf(s), 1);
        });

        events.forEach(({ event, listener }) => {
            s.on(event, (data = {}) => {
                const key = data._key;
                listener(data, (err, data) => {
                    const response = {};
                    if (err) {
                        response.error = err;
                    } else {
                        response.data = data;
                    }
                    response._key = key;
                    s.emit(event, response);
                });
            });
        });
        classes.forEach(cls => cls.setSocket(s));
    }

    _socket = null;
    _id = null;

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

    getSession() {
        return this._socket.session;
    }

    broadcast(event, data, includeSelf = false, filter = socket => true) {
        this.constructor._sockets.forEach((socket) => {
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

export default (server) => {
    const io = socketIO(server.getServer());
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
