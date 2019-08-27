import HttpError from 'http-smart-error';

/**
 * @typedef {import('./socket').Socket} Socket
 * @typedef {import('./session').default} Session
 */

function requireAuth(d) {
	const { descriptor } = d;
	const original = descriptor.value;
	if (typeof original === 'function') {
		// eslint-disable-next-line func-names
		descriptor.value = function (...args) {
			const socket = args[0];
			if (!socket.getSession().getUser()) {
				throw HttpError.create(401);
			}
			return original.apply(this, args);
		};
	}
	return d;
}

/**
 * Base class to handle multiple socket events.
 * After the registration to the server app the events are created as [className].[method].
 *
 * @example
 * class User extends SocketClass {
 *	  load(session, data, next) {
 *		  next(null, { id: 1, name: 'Baf Lek' });
 *	  }
 * }
 * // The socket event will be user.load
 *
 */
export default class SocketClass {

	static requireAuth = requireAuth;

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
				const listener = (session, data, next) => this[method].apply(this, [session, data, next]);
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
