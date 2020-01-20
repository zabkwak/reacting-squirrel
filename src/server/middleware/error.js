import HttpError from 'http-smart-error';

/**
 * @param {import('../').default} server
 */
export default (server) => (err, req, res, next) => {
	const { dev, errorHandler } = server.getConfig();
	if (!(err instanceof HttpError)) {
		if (typeof err === 'string') {
			// eslint-disable-next-line no-param-reassign
			err = { message: err };
		}
		const { message, code, ...payload } = err;
		// eslint-disable-next-line no-param-reassign
		err = HttpError.create(err.statusCode || 500, message, code, HttpError.parsePayload(payload));
	}
	if (res.statusCode === 200) {
		res.status(err.statusCode);
	}
	if (!err.path) {
		// eslint-disable-next-line no-param-reassign
		err.path = req.originalUrl;
	}
	if (!err.spec) {
		// eslint-disable-next-line no-param-reassign
		err.spec = req.route ? req.route.path : req.path;
	}
	if (!err.pathname) {
		// eslint-disable-next-line no-param-reassign
		err.pathname = req.path;
	}
	// eslint-disable-next-line no-underscore-dangle
	server._error(err);
	const render = () => {
		res.render({
			title: err.message,
			data: {
				user: req.session.getUser(),
				dev,
				timestamp: Date.now(),
				error: err.toJSON(dev),
				// eslint-disable-next-line no-underscore-dangle
				version: server._version,
			},
		});
	};
	if (typeof errorHandler !== 'function') {
		render();
		return;
	}
	errorHandler(err, req, res, () => render());
};
