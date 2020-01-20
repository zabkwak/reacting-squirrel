import cookieSignature from 'cookie-signature';

/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => {
	const { session, cookies } = server.getConfig();
	const { secret, secure, httpOnly } = cookies;
	let sessionId;
	const setSession = () => {
		sessionId = session.generateId();
		res.cookie(
			'session_id',
			cookieSignature.sign(sessionId, secret),
			{ secure, httpOnly },
		);
	};
	if (!req.cookies.session_id) {
		// eslint-disable-next-line no-underscore-dangle
		server._log('Session id not found. Generating.');
		setSession();
	} else {
		sessionId = cookieSignature.unsign(req.cookies.session_id, secret);
		if (!sessionId) {
			// eslint-disable-next-line no-underscore-dangle
			server._log('Session secret not match. Generating.');
			setSession();
		}
	}
	req.session = new server.Session(sessionId);
	next();
};
