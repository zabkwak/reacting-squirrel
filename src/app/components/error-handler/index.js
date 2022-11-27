import React from 'react';
// eslint-disable-next-line import/no-cycle
import Component from '../component';

import './style.scss';

export default class ErrorHandler extends Component {

	static getDerivedStateFromError(error) {
		return { error };
	}

	// eslint-disable-next-line react/state-in-constructor
	state = {
		error: false,
	};

	componentDidCatch(error, errorInfo) {
		this.getContext().logComponentError('Component error', error, errorInfo);
	}

	render() {
		const { children } = this.props;
		const { error } = this.state;
		if (error) {
			if (this.getContext().DEV) {
				return (
					<div className="rs-error-handler">
						<h2>Component error</h2>
						<p>{error.message}</p>
						<pre>{error.stack}</pre>
					</div>
				);
			}
			return (
				<div className="rs-error-handler">
					<h2>Something went wrong</h2>
				</div>
			);
		}
		return children;
	}
}
