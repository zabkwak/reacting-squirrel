import React from 'react';
import PropTypes from 'prop-types';

import Page from './components/component.page';

export default class ErrorPage extends Page {

	static props = {
		error: PropTypes.shape({
			message: PropTypes.string.isRequired,
			code: PropTypes.string.isRequired,
			stack: PropTypes.string,
		}),
	};

	render() {
		const { message } = this.props.error;
		return (
			<div className="error">
				<h2>{message}</h2>
				{this.renderStack()}
			</div>
		);
	}

	renderStack() {
		const { stack } = this.props.error;
		if (!stack) {
			return null;
		}
		return (
			<p>
				{stack.split('\n').map((entry, index) => {
					const key = `${entry}-${index}`;
					return (
						<span key={key} style={{ paddingLeft: index === 0 ? undefined : 20 }}>
							{entry}
							<br />
						</span>
					);
				})}
			</p>
		);
	}
}
