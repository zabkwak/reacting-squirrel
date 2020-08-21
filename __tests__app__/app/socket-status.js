import React from 'react';

import { SocketComponent, Text } from '../../src/app';

export default class SocketStatus extends SocketComponent {

	state = {
		state: 'connecting',
		error: null,
	};

	onSocketStateChanged(state) {
		this.setState({ state });
	}

	onSocketError(error) {
		this.setState({ error });
	}

	render() {
		const { state, error } = this.state;
		if (error) {
			return (
				<div className="status-wrapper">
					<Text dictionaryKey="socket_error" args={[error]} />
					<button onClick={() => location.reload(true)}>{this.getText('reload')}</button>
				</div>
			);
		}
		return (
			<div className="status-wrapper">
				<Text dictionaryKey="socket_status" args={[this.getText(`socket_state_${state}`)]} />
			</div>
		);
	}
}
