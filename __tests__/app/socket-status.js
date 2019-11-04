import React from 'react';

import { SocketComponent, Text, Button } from '../../src/app';

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
					<Button onClick={() => location.reload(true)}>{this.getText('reload')}</Button>
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
