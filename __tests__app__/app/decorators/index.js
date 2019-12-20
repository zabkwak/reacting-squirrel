/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-alert */
import {
	Page,
} from '../../../src/app';

// eslint-disable-next-line import/extensions
import User from './user.js';
import UserTS from './user.ts';

export default class Decorators extends Page {

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
