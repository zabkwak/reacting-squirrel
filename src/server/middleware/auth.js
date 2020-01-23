/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => server.auth(req.session, next);
