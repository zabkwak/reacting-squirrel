/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => {
	const { locale } = server.getConfig();
	let userLocale = locale.default;
	// TODO somehow share constants between app and server
	if (req.cookies['rs~locale']) {
		userLocale = req.cookies['rs~locale'];
	} else {
		const [preferredLocale] = req.acceptsLanguages();
		if (locale.accepted.includes(preferredLocale)) {
			userLocale = preferredLocale;
		} else {
			for (let i = 0; i < locale.accepted.length; i++) {
				const acceptedLocale = locale.accepted[i];
				if (req.acceptsLanguages(acceptedLocale)) {
					userLocale = acceptedLocale;
					break;
				}
			}
		}
	}
	req.locale = userLocale;
	next();
};
