class Storage {

	size() {
		return this._getLocalStorage().length;
	}

	has(key) {
		return Boolean(this._getLocalStorage().getItem(key));
	}

	set(key, data) {
		this._getLocalStorage().setItem(key, JSON.stringify({ data }));
	}

	get(key) {
		const data = this._getLocalStorage().getItem(key);
		if (!data) {
			return null;
		}
		return JSON.parse(data).data;
	}

	delete(key) {
		this._getLocalStorage().removeItem(key);
	}

	clear() {
		this._getLocalStorage().clear();
	}

	_getLocalStorage() {
		// TODO validate if localstorage exists
		return localStorage;
	}

}

export default new Storage();
