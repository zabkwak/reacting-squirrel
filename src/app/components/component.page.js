import PropTypes from 'prop-types';
import SocketComponent from './component.socket';

/**
 * Base page component to handle content.
 * All pages registered to the Router has to extends this class.
 */
export default class Page extends SocketComponent {

    static propTypes = {
        params: PropTypes.any.isRequired,
        query: PropTypes.any.isRequired,
        initialData: PropTypes.any.isRequired,
    }

    componentDidMount() {
        super.componentDidMount();
        if (this.getContext().DEV) {
            console.log(`Page '${this.constructor.name}' did mount`, this.props);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this.getContext().DEV) {
            console.log(`Page '${this.constructor.name}' will unmount`);
        }
    }
}
