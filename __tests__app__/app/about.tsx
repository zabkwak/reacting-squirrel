import * as React from 'react';

import { Page } from '../../src/app';

import TSComponent from './ts-component';

interface IState {
	test: string;
}

export default class About extends Page {

	state: IState = {
		test: null,
	};

	async componentDidMount() {
		super.componentDidMount();
		console.log(await this.requestAsync('user.get'));
	}

	render() {
		return (
			<div className="about-wrapper">
				<h1>About 3</h1>
				<TSComponent />
			</div>
		);
	}
}
