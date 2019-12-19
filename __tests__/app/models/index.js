import {
	Page,
} from '../../../src/app';

// eslint-disable-next-line import/extensions
import User from './user';

export default class Decorators extends Page {

	async componentDidMount() {
		super.componentDidMount();
		const user = new User();
		try {
			await user.load();
			console.log(user);
		} catch (e) {
			// eslint-disable-next-line no-undef
			alert(e.message || e);
		}
	}

	_render() {
		return null;
	}
}
