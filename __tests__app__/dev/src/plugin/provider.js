import React from 'react';

export default class Provider extends React.Component {

	render() {
		const { children } = this.props;
		return (
			<div style={{ backgroundColor: 'purple' }}>{children}</div>
		);
	}
}
