import React from 'react';
import PropTypes from 'prop-types';

import SocketComponent from './component.socket';

/**
 * Base page component to handle content.
 * All pages registered to the Router has to extends this class.
 */
export default class Page extends SocketComponent {

	static propTypes = {
		// eslint-disable-next-line react/forbid-prop-types
		params: PropTypes.any.isRequired,
		// eslint-disable-next-line react/forbid-prop-types
		query: PropTypes.any.isRequired,
		// eslint-disable-next-line react/forbid-prop-types
		initialData: PropTypes.any.isRequired,
	}

	__pageRender__ = () => this.onPageRender();

	componentDidMount() {
		super.componentDidMount();
		this.getContext().addListener('pagerender', this.__pageRender__);
		this.getContext().logInfo(`Page '${this.constructor.name}' did mount`, this.props);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this.getContext().removeListener('pagerender', this.__pageRender__);
		this.getContext().logInfo(`Page '${this.constructor.name}' will unmount`);
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

	onPageRender() { }

	setTitle(title) {
		this.getContext().setTitle(title);
	}
}
