import cookieSignature from 'cookie-signature';

/**
 * @param {import('..').default} server
 */
export default (server) => (req, res, next) => {
	const { cookies } = server.getConfig();
	const { secret, domain, sameSite } = cookies;
	let secure = req.protocol !== 'http';
	if (typeof cookies.secure === 'boolean') {
		secure = cookies.secure;
	}
	let httpOnly = true;
	if (typeof cookies.httpOnly === 'boolean') {
		httpOnly = cookies.httpOnly;
	}
	req.getCookie = (name) => {
		if (req.cookies[name]) {
			const value = cookieSignature.unsign(req.cookies[name], secret);
			if (value) {
				return value;
			}
			server.logError('COOKIES', 'The cookie could not be unsigned.', { name, value: req.cookies[name] });
		}
		return null;
	};
	res.setCookie = (name, value, options) => {
		res.cookie(
			name,
			cookieSignature.sign(value, secret),
			{
				secure,
				httpOnly,
				domain: req.cookieDomain || domain,
				sameSite,
				...options,
			},
		);
	};
	next();
};
