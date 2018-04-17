import uniqid from 'uniqid';


export default class Session {

    static generateId() {
        return uniqid();
    }

    id = null;
    _user = null;

    constructor(id) {
        this.id = id;
    }

    setUser(user) {
        this._user = user;
    }

    getUser() {
        return this._user;
    }
}
