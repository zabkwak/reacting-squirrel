import uniqid from 'uniqid';

/**
 * Base session class.
 */
export default class Session {

    /**
     * Generates the random string as a session id.
     */
    static generateId() {
        return uniqid();
    }

    /**
     * Id of the session.
     * @type {string}
     */
    id = null;

    _user = null;

    /**
     * Creates new session instance.
     *
     * @param {string} id Identificator of the session.
     */
    constructor(id) {
        this.id = id;
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
}
