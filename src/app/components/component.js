import React, { Component as Base } from 'react';

import Application from '../application';
import Text from './text';

const STATE_STORAGE_PREFIX = 'component_state_';

/**
 * Base application React Component. It registeres window.onpopstate event for updates of the component's states.
 */
export default class Component extends Base {

	static _stateStorage = {};

	_mounted = false;

	/**
	 * The listener on popstate event of the application.
	 *
	 * @param {Application} application
	 * @param {*} event
	 * @private
	 */
	__popState__ = (application, event) => {
		this.onPopState(event);
	};

	componentDidMount() {
		this.getContext().addListener('popstate', this.__popState__);
		if (this.getStateKey()) {
			this.loadState(this.getStateKey());
		}
		this._mounted = true;
	}

	componentWillUnmount() {
		this.getContext().removeListener('popstate', this.__popState__);
		if (this.getStateKey()) {
			this.saveState(this.getStateKey());
		}
		this._mounted = false;
	}

	render() {
		if (!this.getContext().DEV) {
			return null;
		}
		return (
			<div
				style={{
					padding: 10,
					backgroundColor: '#F0F0F0',
				}}
			>
				<h1 style={{ textAlign: 'center' }}>{this.constructor.name}</h1>
			</div>
		);
	}

	/**
	 * Gets the application context.
	 */
	getContext() {
		return Application;
	}

	getText(key, ...args) {
		return Text.get(key, ...args);
	}

	getJSXText(key, ...args) {
		return Text.getJSX(key, ...args);
	}

	/**
	 * Method called after the window.onpopstate event.
	 *
	 * @param {*} event
	 */
	onPopState(event) { }

	/**
	 * Saves the component state to memory storage.
	 * @param {string} key
	 */
	saveState(key) {
		// eslint-disable-next-line no-underscore-dangle
		Component._stateStorage[`${STATE_STORAGE_PREFIX}${key}`] = { ...this.state };
	}

	/**
	 * Loads the saved state and sets it to the component state.
	 * @param {string} key
	 * @returns {Promise<void>}
	 */
	loadState(key) {
		return new Promise((resolve) => {
			// eslint-disable-next-line no-underscore-dangle
			const state = Component._stateStorage[`${STATE_STORAGE_PREFIX}${key}`];
			if (state) {
				this.setState(state, resolve);
				return;
			}
			resolve();
		});
	}

	/**
	 * Gets the state key for memory storage. If the method returns string the saveState and loadState methods are automatically called in the component lifecycle.
	 * @returns {string}
	 */
	getStateKey() {
		return null;
	}

}
