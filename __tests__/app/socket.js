import React from 'react';
import {
	Page,
} from '../../src/app';

export default class Socket extends Page {

	state = {
		sending: false,
		uploadStatus: null,
	}

	async componentDidMount() {
		super.componentDidMount();
		try {
			await this.requestAsync('socket.test', {
				test: 'test',
				array: ['test'],
				object: { test: 'test' },
				date: new Date(),
				null: null,
				undefined: undefined,
			});
		} catch (e) {
			// alert(e.message);
		}
	}

	render() {
		const { uploadStatus, sending } = this.state;
		return (
			<div>
				<h1>SOCKET TEST</h1>
				<form
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<div>
						<span>{uploadStatus}</span>
					</div>
					<input
						type="file"
						name="file"
						multiple={false}
						disabled={sending}
						onChange={async (e) => {
							const file = e.target.files[0];
							this.setState({
								uploadStatus: 'Preparing upload',
							});
							await this.requestAsync('socket.file', { file, name: file.name }, 60000, (p) => {
								if (p < 1) {
									this.setState({ uploadStatus: `${Math.round(p * 100)}%` });
									return;
								}
								this.setState({ uploadStatus: 'Processing' });
							});
							this.setState({
								uploadStatus: 'Uploaded',
							});
						}}
					/>
				</form>
			</div>
		);
	}
}
