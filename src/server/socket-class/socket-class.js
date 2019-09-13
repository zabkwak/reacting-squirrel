import requireAuth from './decorator.requireAuth';
import broadcast from './decorator.broadcast';
import notSocketMethod from './decorator.notSocketMethod';

/**
 * @typedef {import('../socket').Socket} Socket
 * @typedef {import('../session').default} Session
 */

/**
 * Base class to handle multiple socket events.
 * After the registration to the server app the events are created as [className].[method].
 *
 * @example
 * class User extends SocketClass {
 *	  load(socket, data, next) {
 *		  next(null, { id: 1, name: 'Baf Lek' });
 *	  }
 * }
 * // The socket event will be user.load
 *
 */
export default class SocketClass {

	static requireAuth = requireAuth;

	static broadcast = broadcast;

	static notSocketMethod = notSocketMethod;

	/**
	 * @typedef SocketEvent
	 * @property {string} event
	 * @property {function} listener
	 */


	/** @type {Socket} */
	_socket = null;

	static _notSocketMethods = {};

	/**
	 * Gets the list of all events and their listeners.
	 *
	 * @returns {SocketEvent[]}
	 */
	getEvents() {
		const className = this.constructor.name;
		// eslint-disable-next-line no-underscore-dangle
		const notSocketMethods = SocketClass._notSocketMethods[className] || [];
		return Object
			.getOwnPropertyNames(this.constructor.prototype)
			// eslint-disable-next-line arrow-body-style
			.filter((method) => {
				return !['constructor', 'getEvents', 'addNotSocketMethod', 'broadcast', 'setSocket', 'getSession', 'getUser'].includes(method)
					&& !notSocketMethods.includes(method)
					&& method.indexOf('_') !== 0;
			})
			.map((method) => {
				const event = `${className.toLowerCase()}.${method}`;
				const listener = (session, data, next) => this[method].apply(this, [session, data, next]);
				return { event, listener };
			});
	}

	addNotSocketMethod(targetName, methodName) {
		// eslint-disable-next-line no-underscore-dangle
		if (!SocketClass._notSocketMethods[targetName]) {
			// eslint-disable-next-line no-underscore-dangle
			SocketClass._notSocketMethods[targetName] = [];
		}
		// eslint-disable-next-line no-underscore-dangle
		SocketClass._notSocketMethods[targetName].push(methodName);
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
