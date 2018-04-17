export default class SocketClass {

    _socket = null;

    getEvents() {
        return Object
            .getOwnPropertyNames(this.constructor.prototype)
            .filter(method => ['constructor', 'getEvents', 'broadcast', 'setSocket'].indexOf(method) < 0)
            .map((method) => {
                const event = `${this.constructor.name.toLowerCase()}.${method}`;
                const listener = (data, next) => {
                    this[method].apply(this, [data, next]);
                };

                return { event, listener };
            });
    }

    broadcast(event, data, includeSelf = false, filter = socket => true) {
        this._socket.broadcast(event, { data }, includeSelf, filter);
    }

    setSocket(socket) {
        this._socket = socket;
    }

    getSession() {
        this._socket.getSession();
    }
}
