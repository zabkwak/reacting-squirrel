import PropTypes from 'prop-types';

import SocketComponent from './component.socket';

/**
 * Base page component to handle content.
 * All pages registered to the Router has to extends this class.
 */
export default class Page extends SocketComponent {
	static propTypes = {
		// eslint-disable-next-line react/forbid-prop-types
		params: PropTypes.any.isRequired,
		// eslint-disable-next-line react/forbid-prop-types
		query: PropTypes.any.isRequired,
		// eslint-disable-next-line react/forbid-prop-types
		initialData: PropTypes.any.isRequired,
	};

	__pageRender__ = () => this.onPageRender();

	componentDidMount() {
		super.componentDidMount();
		this.getContext()
			._callListener('pagerender', this)
			.addListener('pagerender', this.__pageRender__)
			.logInfo(`Page '${this.constructor.name}' did mount`, this.props);
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this.getContext()
			.removeListener('pagerender', this.__pageRender__)
			.logInfo(`Page '${this.constructor.name}' will unmount`);
	}

	onPageRender() {}

	setTitle(title) {
		this.getContext().setTitle(title);
	}

	getTitle() {
		return this.getContext().getTitle();
	}
}
