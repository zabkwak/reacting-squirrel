import React from 'react';
import {
	Page,
} from '../../../src/app';

// eslint-disable-next-line import/extensions
import User from './user.js';
import UserTS from './user.ts';


export default class Home extends Page {

	async componentDidMount() {
		super.componentDidMount();
		const user = new User();
		try {
			console.log(await user.get());
		} catch (e) {
			alert(e.message || e);
		}
		const userTS = new UserTS();
		try {
			console.log(await userTS.get());
		} catch (e) {
			alert(e.message || e);
		}
	}

	render() {
		return null;
	}
}
