import { Socket } from './socket';
/**
 * Base class to handle multiple socket events.
 * After the registration to the server app the events are created as [className].[method].
 *
 * @example
 * class User extends SocketClass {
 *      load(data, next) {
 *          next(null, { id: 1, name: 'Baf Lek' });
 *      }
 * }
 * // The socket event will be user.load
 *
 */
export default class SocketClass {

    /**
     * @typedef SocketEvent
     * @property {string} event
     * @property {function} listener
     */


    /** @type {Socket} */
    _socket = null;

    /**
     * Gets the list of all events and their listeners.
     *
     * @returns {SocketEvent[]}
     */
    getEvents() {
        return Object
            .getOwnPropertyNames(this.constructor.prototype)
            .filter(method => ['constructor', 'getEvents', 'broadcast', 'setSocket', 'getSession', 'getUser'].indexOf(method) < 0)
            .map((method) => {
                const event = `${this.constructor.name.toLowerCase()}.${method}`;
                const listener = (data, next) => this[method].apply(this, [data, next]);
                return { event, listener };
            });
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
        this._socket.broadcast(event, { data }, includeSelf, filter);
    }

    /**
     * Sets the current socket.
     *
     * @param {Socket} socket Current requesting socket.
     */
    setSocket(socket) {
        this._socket = socket;
    }

    /**
     * Gets the session from the socket.
     *
     * @returns {Session}
     */
    getSession() {
        return this._socket.getSession();
    }

    /**
     * Gets the user from the session.
     */
    getUser() {
        return this.getSession().getUser();
    }
}
