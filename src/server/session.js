import uniqid from 'uniqid';

/**
 * Base session class.
 */
export default class Session {
	static _instances = {};

	/**
	 * Generates the random string as a session id.
	 */
	static generateId() {
		return uniqid();
	}

	static getInstance(id) {
		return this._instances[id] || new this(id);
	}

	/**
	 * Id of the session.
	 * @type {string}
	 */
	id = null;

	_user = null;

	_server = null;

	/**
	 * Creates new session instance.
	 *
	 * @param {string} id Identificator of the session.
	 */
	constructor(id) {
		if (Session._instances[id]) {
			throw new Error('Session instance already exist.');
		}
		if (id) {
			this.id = id;
			Session._instances[id] = this;
		}
	}

	/**
	 * Sets the user instance to the session.
	 * @param {*} user User's data.
	 */
	setUser(user) {
		this._user = user;
	}

	/**
	 * Gets the user added to the session.
	 */
	getUser() {
		return this._user;
	}

	getServer() {
		return this._server;
	}
}
