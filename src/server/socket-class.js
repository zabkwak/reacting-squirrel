/* eslint-disable func-names */
import HttpError from 'http-smart-error';

/**
 * @typedef {import('./socket').Socket} Socket
 * @typedef {import('./session').default} Session
 */

function requireAuth(target, name, descriptor) {
	const original = descriptor.value;
	if (typeof original === 'function') {
		// eslint-disable-next-line no-param-reassign
		descriptor.value = function (...args) {
			const socket = args[0];
			if (!socket.getSession().getUser()) {
				throw HttpError.create(401);
			}
			return original.apply(this, args);
		};
	}
	return descriptor;
}

function broadcast(filter = null, event = null, includeSelf = false) {
	return function (target, name, descriptor) {
		const ev = `${target.constructor.name.toLowerCase()}.${name}`;
		const original = descriptor.value;
		if (typeof original === 'function') {
			// eslint-disable-next-line no-param-reassign
			descriptor.value = function (...args) {
				const socket = args[0];
				const r = original.apply(this, args);
				if (r instanceof Promise) {
					r
						.then((data) => {
							socket.broadcast(event || ev, { data }, includeSelf, filter);
						})
						// The error is handled in the SocketClass. This code prevents logging of the UnhandledPromiseRejection.
						.catch((e) => { });
				} else {
					// eslint-disable-next-line no-console
					console.warn('Broadcast decorator is not supported in non-promise socket method.');
				}
				return r;
			};
		}
	};
}

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
			// eslint-disable-next-line arrow-body-style
			.filter((method) => {
				return !['constructor', 'getEvents', 'broadcast', 'setSocket', 'getSession', 'getUser'].includes(method)
					&& method.indexOf('_') !== 0;
			})
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
