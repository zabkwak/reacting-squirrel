/**
 * Emitter to emit callback for the components.
 */
export default class CallbackEmitter {

	/**
	 * Map of all events with their registered listeners.
	 * @type {Object.<string, function[]>}
	 */
	_listeners = {};

	/**
	 * Adds the listener to the event.
	 *
	 * @param {string} event
	 * @param {function(ref, args):void} listener
	 */
	addListener(event, listener) {
		if (!this._hasEventRegistered(event)) {
			this._listeners[event] = [];
		}
		this._listeners[event].push(listener);
		return this;
	}

	/**
	 * Removes the listener from the event.
	 *
	 * @param {string} event
	 * @param {function(ref, args)} listener
	 */
	removeListener(event, listener) {
		if (!this._hasEventRegistered(event)) {
			console.warn(`Event '${event}' not set`);
			return this;
		}
		const index = this._listeners[event].indexOf(listener);
		if (index < 0) {
			return this;
		}
		this._listeners[event].splice(index, 1);
		return this;
	}

	/**
	 * Calls all listeners registered on the event.
	 *
	 * @param {string} event
	 * @param {any} args
	 */
	_callListener(event, args = {}) {
		if (!this._hasEventRegistered(event)) {
			return;
		}
		this._listeners[event].forEach(listener => listener(this, args));
	}

	/**
	 * Checks if the event is registered to the listener.
	 *
	 * @param {string} event
	 * @returns {boolean}
	 */
	_hasEventRegistered(event) {
		return Object.prototype.hasOwnProperty.call(this._listeners, event);
	}
}
