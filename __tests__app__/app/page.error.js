import React from 'react';

import { ErrorPage as Base } from '../../src/app';

export default class ErrorPage extends Base {

	render() {
		const { message } = this.props.error;
		return (
			<div className="error">
				<h2>{message}</h2>
				{this.renderStack()}
				<h3>Custom error text</h3>
			</div>
		);
	}
}
