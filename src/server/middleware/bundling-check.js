import { BUNDLE_STATUS_ROUTE } from '../constants';
import Layout from '../layout-bundling';

/**
 * @param {import('..').default} server
 */
export default (server) => (req, res, next) => {
	if (!server.bundling) {
		next();
		return;
	}
	if (req.path === BUNDLE_STATUS_ROUTE) {
		next();
		return;
	}
	res.header('content-type', 'text/html');
	res.renderLayout({ layout: Layout });
};
