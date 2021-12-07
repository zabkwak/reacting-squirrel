/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => {
	const { session } = server.getConfig();
	let sessionId;
	const setSession = () => {
		sessionId = session.generateId();
		res.setCookie('session_id', sessionId);
	};
	if (!req.cookies.session_id) {
		// eslint-disable-next-line no-underscore-dangle
		server._log('Session id not found. Generating.');
		setSession();
	} else {
		sessionId = req.getCookie('session_id');
		if (!sessionId) {
			// eslint-disable-next-line no-underscore-dangle
			server._log('Session secret not match. Generating.');
			setSession();
		}
	}
	req.session = server.Session.getInstance(sessionId);
	req.session._server = server;
	next();
};
