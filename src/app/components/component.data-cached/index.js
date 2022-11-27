import React from 'react';

import SocketComponent from '../component.socket';
import Loader from '../loader';

import './style.scss';

export default class CachedDataComponent extends SocketComponent {

	static _store = {};

	static defaultProps = {
		onData: null,
		onError: null,
		load: null,
	};

	state = {
		data: null,
		error: null,
		loading: true,
		refresh: false,
		LoaderComponent: null,
		onData: null,
		onError: null,
		load: null,
		update: null,
		renderError: null,
	};

	async componentDidMount() {
		super.componentDidMount();
		const { refresh } = this.props;
		if (this._hasStoredData() && !refresh) {
			this._handleData(this._getStoredData());
			return;
		}
		await this.load();
	}

	render() {
		const {
			dataKey,
			onData,
			onError,
			load,
			update,
			refresh,
			LoaderComponent,
			children,
			renderError,
			transformData,
			...divProps
		} = this.props;
		const { data, error, loading } = this.state;
		const classNames = divProps.className ? divProps.className.split(' ') : [];
		classNames.push('rs-datastore-component');
		return (
			<div {...divProps} className={classNames.join(' ')}>
				{
					loading && this.renderLoader()
				}
				{
					error && this.renderError(error)
				}
				{
					!error && data && this.renderData(data)
				}
			</div>
		);
	}

	renderLoader() {
		const { LoaderComponent } = this.props;
		return LoaderComponent || <Loader loading={false} block={false} size="small" />;
	}

	renderError(error) {
		const { renderError } = this.props;
		if (typeof renderError === 'function') {
			return renderError(error);
		}
		return (
			<p>Error: {error?.message || error}</p>
		);
	}

	renderData(data) {
		const { children } = this.props;
		if (typeof children === 'function') {
			return children(data, this);
		}
		if (!this.getContext().DEV) {
			throw new Error('No render method defined.');
		}
		return (
			<p>{JSON.stringify(data)}</p>
		);
	}

	async load() {
		let data;
		this.setState({ loading: true, error: null });
		try {
			data = await this._load();
		} catch (error) {
			this._handleError(error);
			return;
		}
		this._handleData(data);
	}

	async update() {
		let data;
		this.setState({ loading: true, error: null });
		try {
			data = await this._update();
		} catch (error) {
			this._handleError(error);
			return;
		}
		this._handleData(data);
	}

	clear() {
		this.constructor._store[this._getDataKey()] = null;
		this.setState({ data: null });
	}

	async _load() {
		const { load } = this.props;
		if (typeof load === 'function') {
			return load(this);
		}
		throw new Error('No load property defined.');
	}

	async _update() {
		const { update } = this.props;
		const { data } = this.state;
		if (typeof update === 'function') {
			return update(data);
		}
		throw new Error('No update property defined.');
	}

	_handleData(data) {
		const { onData } = this.props;
		data = this._transformData(data);
		this._storeData(data);
		this.setState({ data, loading: false });
		if (typeof onData === 'function') {
			onData(data);
		}
	}

	_handleError(error) {
		const { onError } = this.props;
		this.setState({ error, loading: false });
		if (typeof onError === 'function') {
			onError(error);
		}
	}

	_transformData(data) {
		const { transformData } = this.props;
		if (typeof transformData === 'function') {
			return transformData(data);
		}
		return data;
	}

	_getDataKey() {
		const { dataKey } = this.props;
		if (!dataKey) {
			throw new Error('No dataKey defined.');
		}
		return dataKey;
	}

	_hasStoredData() {
		return !!this._getStoredData();
	}

	_getStoredData() {
		return this.constructor._store[this._getDataKey()];
	}

	_storeData(data) {
		this.constructor._store[this._getDataKey()] = data;
	}
}
