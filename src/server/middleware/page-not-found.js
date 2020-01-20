import HttpError from 'http-smart-error';

export default () => (req, res, next) => next(HttpError.create(404, 'Page not found'));
