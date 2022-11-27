export default async (err, req, res, next) => {
	if (err.statusCode === 401 || err.statusCode === 403) {
		res.redirect(`/login?redirect=${encodeURIComponent(req.originalUrl)}&e=${err.code}`);
		return;
	}
	next();
};
