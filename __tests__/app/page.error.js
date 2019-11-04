import { ErrorPage as Base } from '../../src/app';

export default class ErrorPage extends Base {

	componentDidMount() {
		super.componentDidMount();
		console.log('custom error');
	}
}
