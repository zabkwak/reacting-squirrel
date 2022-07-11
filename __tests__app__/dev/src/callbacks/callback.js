export default (req, res, next) => {
	res.json({
		path: req.path,
	});
};
