import React from 'react';
import {
	Page, Text, Loader, DataComponent, Utils, SocketRequest,
} from '../../src/app';

import './home.css';
import './home.scss';

/*
function test(c, eventName, emit, data) {
	// eslint-disable-next-line func-names
	return function (target, name, descriptor) {
		const events = c.getEvents();
		c.getEvents = function() {
			return [
				...events,
				{
					state: name,
					name: eventName,
					emit,
					data,
				}
			];
		};
		return descriptor;
	};
}
*/

export default class Home extends Page {

	state = {
		// @test(this, 'user.getPromise', true)
		user: null,
	};

	async componentDidMount() {
		super.componentDidMount();
		await this.loadState('homepage');
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
					// eslint-disable-next-line react/jsx-one-expression-per-line
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
					// eslint-disable-next-line react/jsx-one-expression-per-line
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
					// eslint-disable-next-line react/jsx-one-expression-per-line
					renderError={({ message, code, statusCode }) => <h2>Error: {statusCode} {code} - {message}</h2>}
					loaderBlock={false}
					loaderSize="small"
				/>
				<DataComponent
					events={[{
						name: 'update.init',
						key: 'date',
						update: 'update.update',
					}]}
					renderData={({ date }) => <h2>{date}</h2>}
					// eslint-disable-next-line react/jsx-one-expression-per-line
					renderError={({ message, code, statusCode }) => <h2>Error: {statusCode} {code} - {message}</h2>}
					loaderBlock={false}
					loaderSize="small"
					tookDisabled
				/>
				<button onClick={() => this.getContext().navigate('/about')} id="navigate-button" type="button">About page</button>
				<button onClick={() => this.getContext().refreshContent()} id="refresh-button" type="button">Refresh content</button>
				<button onClick={() => this.getContext().navigate('/test')} id="test-button" type="button">Invalid page</button>
				<button onClick={() => this.getContext().navigate('/layout-test')} id="layout-button" type="button">Different layout</button>
				<button onClick={() => this.getContext().navigate('/large-data')} id="layout-button" type="button">Large data</button>
				<button
					id="state-button"
					onClick={() => this.getContext().pushState(null, { test: 1 })}
					type="button"
				>
					Push state query
				</button>
				<button
					onClick={async () => {
						console.log(await this.call('user.getAsyncError'));
					}}
					type="button"
				>
					Async request
				</button>
				<a href="/about" onClick={Utils.anchorNavigation}>About page anchor</a>
				<div>
					<Text tag="p" dictionaryKey="args" args={['one', 'two', 'three']} />
				</div>
			</div>
		);
	}

	__getEvents() {
		return [
			{
				name: 'user.getPromise',
				state: 'user',
				emit: true,
			},
		];
	}
}
