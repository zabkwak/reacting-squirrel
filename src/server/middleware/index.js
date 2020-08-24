import LocaleMiddleware from './locale';
import SessionMiddleware from './session';
import RenderMiddleware from './render';
import PageNotFoundMiddleware from './page-not-found';
import ErrorMiddleware from './error';
import AuthMiddleware from './auth';
import CookiesMiddleware from './cookies';
import BundlingMiddleware from './bundling-check';

export {
	// eslint-disable-next-line import/prefer-default-export
	LocaleMiddleware,
	SessionMiddleware,
	RenderMiddleware,
	PageNotFoundMiddleware,
	ErrorMiddleware,
	AuthMiddleware,
	CookiesMiddleware,
	BundlingMiddleware,
};
