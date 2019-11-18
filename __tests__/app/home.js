import React from 'react';
import {
	Page, Button, Text, Loader, DataComponent, Utils,
} from '../../src/app';

import './home.css';
import './home.scss';
import SocketRequest from '../../src/app/socket-request';


export default class Home extends Page {

	state = {
		user: null,
	};

	async componentDidMount() {
		super.componentDidMount();
		await this.loadState('homepage');
		const { user } = this.state;
		if (!user) {
			this.emit('user.get');
			this.on('user.get', (err, user) => {
				if (err) {
					console.error(err);
					return;
				}
				this.setState({ user });
			});
		}
		this.request('user.getPromise', { test: undefined }, (err, user) => {
			if (err) {
				console.error(err);
				return;
			}
			console.log('Getting user using Promise', user);
		});
		this.request('user.getAsyncError', (err) => {
			// alert(err.message);
		});
		try {
			await this.call('user.getAsyncError');
		} catch (e) {
			// alert(e.message);
		}
		console.log('DID MOUNT END');
		console.log(this.getContext().getRef('test'));

		const r = new SocketRequest();
		try {
			console.log(await r.execute('user.get'));
		} catch (e) { }
	}

	componentWillUnmount() {
		this.saveState('homepage');
		super.componentWillUnmount();
	}

	onPageRender() {
		console.log('PAGE RENDERED');
	}

	render() {
		const { user } = this.state;
		return (
			<div className="home-wrapper">
				<Text tag="h1" dictionaryKey="home" />
				{/* <h2>{user ? user.name : '...'}</h2> */}
				<h2>
					<Loader loaded={Boolean(user)} block={false} size="small">
						{user ? user.name : null}
					</Loader>
				</h2>
				<DataComponent
					className="data-component"
					events={[{
						name: 'user.getPromise',
						key: 'user',
					}]}
					onStart={() => console.log('DATA COMPONENT START')}
					renderData={({ user }) => <h2>{user.name}</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<DataComponent
					events={[{
						name: 'user.getAsyncError',
						key: 'user',
					}]}
					renderData={({ user }) => <h2>{user.name}</h2>}
					renderError={({ message, code }) => <h2>Error: {code} - {message}</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<DataComponent
					events={[{
						name: 'user.getSyncError',
						key: 'user',
					}]}
					renderData={({ user }) => <h2>{user.name}</h2>}
					renderError={({ message, code }) => <h2>Error: {code} - {message}</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<DataComponent
					events={[{
						name: 'user.getVoidPromise',
					}]}
					renderData={() => <h2>VOID</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<DataComponent
					events={[{
						name: 'user.getPayloadedError',
					}]}
					renderData={() => <h2>Something</h2>}
					renderError={({ message, code, statusCode }) => <h2>Error: {statusCode} {code} - {message}</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<Button href="/about" id="navigate-button">About page</Button>
				<Button href="/" id="refresh-button" refreshContent>Refresh content</Button>
				<Button href="/test" id="test-button">Invalid page</Button>
				<Button id="state-button" onClick={() => this.getContext().pushState(null, { test: 1 })}>Push state query</Button>
				<Button
					onClick={async () => {
						console.log(await this.call('user.getAsyncError'));
					}}
				>
					Async request
				</Button>
				<a href="/about" onClick={Utils.anchorNavigation}>About page anchor</a>
				<div>
					<Text tag="p" dictionaryKey="args" args={['one', 'two', 'three']} />
				</div>
			</div>
		);
	}
}
