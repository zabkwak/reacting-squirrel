/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import '@babel/polyfill';
import express from 'express';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import md5 from 'md5';
import fs from 'fs';
import async from 'async';
import Error from 'smart-error';
import HttpError from 'http-smart-error';
import compression from 'compression';
import mkdirp from 'mkdirp';
import _ from 'lodash';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import RouteParser from 'route-parser';
import uniqid from 'uniqid';
import Text from 'texting-squirrel';

import Layout from './layout';
import Session from './session';
import Route from './route';
import socket, { Socket } from './socket';
import SocketClass from './socket-class';
import Utils from './utils';
import StylesCompiler from './styles-compiler';
import { TSConfig, RS_DIR } from './constants';
import Plugin from './plugin';
import {
	LocaleMiddleware, SessionMiddleware, RenderMiddleware, PageNotFoundMiddleware, ErrorMiddleware, AuthMiddleware,
} from './middleware';
import {
	WebpackConfig,
} from './config';

/**
 * Server part of the application.
 */
class Server {
	/**
	 * @typedef CustomComponent
	 * @property {string} path Absolute path to the component.
	 * @property {string} elementId Identificator of the DOM element where the component should render.
	 */
	/**
	 * @typedef {import('./').IAppConfig} AppConfig
	 * @typedef {import('./').ISocketEvent} SocketEvent
	 * @typedef {import('./').IMiddleware} IMiddleware
	 */

	/**
	 * Express app instance.
	 * @type {import('express').Express}
	 */
	_app = null;

	/** @type {http.Server} */
	_server = null;

	_webpack = null;

	/** @type {Route[]} */
	_routes = [];

	/** @type Object.<string, Route> */
	_routeCallbacks = {};

	_errorPage = null;

	/** @type {AppConfig} */
	_config = {
		port: 8080,
		staticDir: './public',
		dev: false,
		jsDir: 'js',
		cssDir: 'css',
		filename: 'bundle.js',
		appDir: './app',
		entryFile: null,
		rsConfig: null,
		layoutComponent: Layout,
		cookieSecret: null,
		cookies: {
			secret: Math.random().toString(36).substring(7),
			secure: true,
			httpOnly: true,
		},
		scripts: [],
		styles: [],
		mergeStyles: [],
		session: Session,
		socketMessageMaxSize: (2 ** 20) * 100,
		auth: (session, next) => next(),
		errorHandler: (err, req, res, next) => next(),
		bundlePathRelative: false,
		onWebpackProgress: null,
		webpack: {},
		socketIO: {},
		autoprefixer: {},
		babelTranspileModules: [],
		createMissingComponents: false,
		generatedComponentsExtension: 'tsx',
		moduleDev: false,
		sourceStylesDir: null,
		connectSocketAutomatically: true,
		locale: {
			default: 'en-US',
			accepted: [],
		},
	};

	/**
	 * Absolute path to the javascript directory for the webpack config.
	 * @type {string}
	 */
	_path = null;

	/**
	 * Bundle path in the website structure.
	 * @type {string}
	 */
	_bundlePath = null;

	_version = null;

	/** @type {SocketEvent[]} */
	_socketEvents = [];

	_socketClasses = [];

	/** @type {CustomComponent[]} */
	_components = [];

	_rsConfig = null;

	_beforeExecution = [];

	_nonce = Buffer.from(uniqid()).toString('base64');

	_entryInjections = [];

	_plugins = [];

	/** @type {IMiddleware[]} */
	_middlewares = [];

	// #region Property getters

	/**
	 * Port on which the server listens.
	 * @type {number}
	 */
	get port() {
		return this._config.port;
	}

	/**
	 * Relative path to the static directory for the express app.
	 * @type {string}
	 */
	get staticDir() {
		return this._config.staticDir;
	}

	/**
	 * Absolute path to the static directory for the express app.
	 * @type {string}
	 */
	get staticDirAbsolute() {
		return path.resolve(this.staticDir);
	}

	/**
	 * Flag of the dev status of the app.
	 * @type {boolean}
	 */
	get dev() {
		return this._config.dev;
	}

	/**
	 * Absolute path to the javascript directory for the webpack config.
	 * @type {string}
	 */
	get path() {
		return this._path;
	}

	/**
	 * Bundle path in the website structure.
	 * @type {string}
	 */
	get bundlePath() {
		return this._bundlePath;
	}

	/**
	 * Absolute path to the bundle file in the application structure.
	 * @type {string}
	 */
	get bundlePathAbsolute() {
		const { staticDir, jsDir, filename } = this._config;
		return path.resolve(staticDir, jsDir, filename);
	}

	/**
	 * Relative path to the application directory.
	 * @type {string}
	 */
	get appDir() {
		return this._config.appDir;
	}

	/**
	 * Absolute path to the application directory.
	 * @type {string}
	 */
	get appDirAbsolute() {
		return path.resolve(this.appDir);
	}

	/**
	 * JSX element for the layout component
	 * @type {JSX.Element}
	 */
	get Layout() {
		return this._config.layoutComponent;
	}

	/**
	 * Object of the session.
	 * @type {function}
	 */
	get Session() {
		return this._config.session;
	}

	get nonce() {
		return this._nonce;
	}

	get Text() {
		return Text;
	}

	get version() {
		return this._version;
	}

	// #endregion

	/**
	 * Creates the instance of the server and prepares express app with socket.io.
	 *
	 * @param {AppConfig} config
	 */
	constructor(config = {}) {
		if (!config.cookies || !config.cookies.secret) {
			if (config.cookieSecret) {
				// eslint-disable-next-line no-param-reassign
				config.cookies = { secret: config.cookieSecret };
			} else {
				this._warn('Using default cookie secret. It\'s a random string which changes every server start. It should be overriden in config.\n');
			}
		}
		try {
			this._rsConfig = require(config.rsConfig || path.resolve('./rsconfig.json'));
		} catch (e) {
			if (config.rsConfig) {
				throw e;
			}
		}
		this._config = _.merge(
			this._config,
			this._getConfigFromRSConfig(),
			config,
		);
		if (!(this._config.locale.accepted instanceof Array)) {
			this._config.locale.accepted = [];
		}
		if (!this._config.locale.accepted.includes(this._config.locale.default)) {
			this._config.locale.accepted.unshift(this._config.locale.default);
		}
		if (!this._config.sourceStylesDir) {
			this._warn('Using default sourceStylesDir. It\'s in the express static directory and all sources are accessible over the http.');
			this._config.sourceStylesDir = path.resolve(`${this._config.staticDir}/${this._config.cssDir}`);
		} else {
			this._config.sourceStylesDir = !path.isAbsolute(this._config.sourceStylesDir)
				? path.resolve(this._config.sourceStylesDir)
				: this._config.sourceStylesDir;
		}
		if (!(new this.Session() instanceof Session)) {
			throw new Error('Cannot create instance of Session.');
		}
		if (!(new this.Layout() instanceof Layout)) {
			throw new Error('Cannot create instance of Layout.');
		}
		this._path = path.resolve(`${this._config.staticDir}/${this._config.jsDir}`);
		this._bundlePath = `${this._config.bundlePathRelative
			? ''
			: '/'}${this._config.jsDir}/${this._config.filename}`;
		const pkg = require(path.resolve('./package.json'));
		this._version = pkg.version;
		this._setApp();
		this._log('Server created', this._config);
	}

	// #region Getters

	/**
	 * Gets the http server.
	 *
	 * @returns {http.Server}
	 */
	getServer() {
		return this._server;
	}

	getApp() {
		return this._app;
	}

	getConfig(key = null) {
		return key ? this._config[key] : this._config;
	}

	getLocaleFileName(locale) {
		if (this.isLocaleDefault(locale)) {
			return 'text.json';
		}
		return `text_${locale}.json`;
	}

	getLocaleText(locale, key, ...args) {
		return this._getLocaleText(locale, key, ...args);
	}

	/**
	 * Gets the list of registered socket events.
	 *
	 * @returns {SocketEvent[]}
	 */
	getSocketEvents() {
		return this._socketEvents;
	}

	/**
	 * Gets the list of registered socket classes.
	 *
	 * @returns {SocketClass[]}
	 */
	getSocketClasses() {
		return this._socketClasses;
	}

	// #endregion

	isLocaleDefault(locale) {
		return locale === this._config.locale.default;
	}

	/**
	 * Calls the auth function from the config.
	 *
	 * @param {Session} session
	 * @param {function} next
	 */
	auth(session, next) {
		const { auth } = this._config;
		if (typeof auth === 'function') {
			auth(session, next);
		}
	}

	// #region Registers

	/**
	 * Registers the GET route.
	 *
	 * @param {string} route Route spec.
	 * @param {string} contentComponent Relative path from the {config.appDir} to the component.
	 * @param {string} title Title of the page.
	 * @param {boolean=} requireAuth If true the route requires authorized user.
	 * @param {function=} callback Callback to call when the route is called.
	 */
	get(route, contentComponent, title, requireAuth, callback) {
		return this.registerRoute('get', route, contentComponent, title, requireAuth, null, callback);
	}

	/**
	 * Registers the route.
	 *
	 * @param {'get'|'post'|'put'|'delete'} method HTTP method of the route.
	 * @param {string} route Route spec.
	 * @param {string} contentComponent Relative path from the {config.appDir} to the component.
	 * @param {string} title Title of the page.
	 * @param {boolean=} requireAuth If true the route requires authorized user.
	 * @param {any} layout Alternative layout.
	 * @param {function=} callback Callback to call when the route is called.
	 */
	registerRoute(method, route, contentComponent, title, requireAuth, layout, callback) {
		this._routes.push(new Route(method, route, contentComponent, title, requireAuth, layout, callback));
		return this;
	}

	registerRouteCallback(route, callback) {
		this._routeCallbacks[route] = callback;
		return this;
	}

	/**
	 * Registers the socket class to handle socket events.
	 *
	 * @param {function} Cls Class inherited from SocketClass.
	 */
	registerSocketClass(Cls) {
		const instance = new Cls();
		if (!(instance instanceof SocketClass)) {
			throw new Error(`${Cls} must be inherited from SocketClass`);
		}
		instance.getEvents().forEach(({ event, listener }) => this.registerSocketEvent(event, listener));
		this._socketClasses.push(instance);
		return this;
	}

	/**
	 * Registers the socket event.
	 *
	 * @param {string} event Name of the event.
	 * @param {function} listener Listener to call after the socket request.
	 */
	registerSocketEvent(event, listener) {
		this._socketEvents.push({ event, listener });
		return this;
	}

	/**
	 * Registers react components which are rendered into DOM elements.
	 *
	 * @param {string} componentPath Relative path from the {config.appDir} to the component.
	 * @param {string} elementId Identificator of the DOM element where the component should render.
	 */
	registerComponent(componentPath, elementId) {
		const { appDir } = this._config;
		this._components.push({ path: path.resolve(`${appDir}/${componentPath}`), elementId });
		return this;
	}

	registerErrorPage(componentPath) {
		const { appDir } = this._config;
		this._errorPage = path.resolve(`${appDir}/${componentPath}`);
		return this;
	}

	registerBeforeExecution(spec, callback) {
		// eslint-disable-next-line no-shadow
		const index = this._beforeExecution.map(({ spec }) => spec).indexOf(spec);
		if (index >= 0) {
			this._warn(`Before execution callback for '${spec}' is already registered. Rewriting.`);
			this._beforeExecution.splice(index, 1);
		}
		this._beforeExecution.push({ spec, callback });
		return this;
	}

	registerPlugin(plugin) {
		this._plugins.push(plugin);
		return this;
	}

	registerMiddleware(middleware, afterRoutes = false) {
		if (typeof middleware !== 'function') {
			throw new Error('The middleware must be function.');
		}
		this._middlewares.push({ callback: middleware, afterRoutes: afterRoutes || false });
		return this;
	}

	// #endregion

	/**
	 * Injects the code to the generated entry file.
	 *
	 * @param {string} code
	 */
	injectToEntry(code) {
		if (code) {
			this._entryInjections.push(code);
		}
		return this;
	}

	/**
	 * Starts the express server. In that process it creates all necessary files.
	 *
	 * @param {function=} cb Callback to call after the server start.
	 */
	async start(cb = () => { }) {
		const { dev } = this._config;
		this._log(`App starting DEV: ${dev}`);
		this._registerPlugins();
		this._setMiddlewares();
		this._registerRsConfig();
		try {
			await this._createRSFiles();
		} catch (e) {
			process.nextTick(() => cb(e));
			return;
		}
		this._webpack = WebpackConfig(this);
		this._setMiddlewares(true);
		this._start(cb);
	}

	/**
     * Stops the application.
     * @param {function} cb
     */
	stop(cb = () => { }) {
		if (!this._server) {
			this._warn('Server cannot be stopped beceause it was not started.');
			return;
		}
		this._server.close(() => {
			this._log('The server is stopped.');
			if (typeof cb === 'function') {
				cb();
			}
		});
	}

	_registerPlugins() {
		this._plugins.forEach((plugin) => {
			try {
				plugin.register(this);
				this._log(`Plugin ${plugin.getName()} registered.`);
			} catch (e) {
				this._error(`Plugin ${plugin.getName ? plugin.getName() : 'Unnamed plugin'} register failed.`, e);
			}
		});
	}

	_registerRsConfig() {
		if (this._rsConfig) {
			const {
				routes, components, socketClassDir, errorPage,
			} = this._rsConfig;
			if (routes) {
				Utils.registerRoutes(this, routes.map((route) => (
					{
						...route,
						callback: this._routeCallbacks[route.route],
					}
				)));
			}
			if (components) {
				Utils.registerComponents(this, components);
			}
			if (socketClassDir) {
				Utils.registerSocketClassDir(this, path.resolve(process.cwd(), socketClassDir));
			}
			if (errorPage) {
				this.registerErrorPage(errorPage);
			}
		}
	}

	// #region RS files creators

	/**
	 * Creates the reacting-squirrel files.
	 */
	async _createRSFiles() {
		this._log('Creating RS files');
		const { appDir, staticDir, cssDir } = this._config;
		await this._validateDir(appDir, 'App directory doesn\'t exist. Creating.', 'warn');
		await this._validateDir(this._getRSDirPath(), 'Creating RS directory.');
		await this._validateDir(path.resolve(`${staticDir}/${cssDir}`), 'Creating CSS directory.');
		return new Promise((resolve, reject) => {
			async.each([
				'_createResDir',
				'_createNonceFile',
				'_createEntryFile',
				'_setRoutes',
				'_createComponentsFile',
				'_createSocketMap',
				'_createPostCSSConfig',
				'_createTSConfig',
				// '_compileProductionStyles',
			], (f, callback) => this[f].call(this, callback), (err) => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}

	/**
	 * Registers the routes to the express app and creates the routing map for the front-end.
	 *
	 * @param {function(Error):void} cb Callback called after the registration of the routes and creation of the routing map.
	 */
	_setRoutes(cb) {
		this._log('Setting routes');
		const {
			dev, appDir, layoutComponent, createMissingComponents,
		} = this._config;
		const componentsMap = {};
		this._routes.forEach((route) => {
			if (!route.contentComponent) {
				this._warn(`Content component for ${route.spec} no set.`);
				return;
			}
			const key = `__${md5(`${route.type}${route.spec}`)}__`;
			const modulePath = path.resolve(`${appDir}/${route.contentComponent}`);
			componentsMap[key] = {
				title: route.title,
				spec: route.spec,
				path: modulePath,
			};
			// If the page component doesn't exist and the server shouldn't generate page components don't register the route.
			if (!this._componentExists(modulePath) && !createMissingComponents) {
				this._warn(`Content component for ${route.spec} doesn't exist.`);
				return;
			}
			this._app[route.method](route.spec, async (req, res, next) => {
				if (route.requireAuth && req.session.getUser() === null) {
					next(HttpError.create(401));
					return;
				}
				try {
					await this._beforeCallback(req, res);
				} catch (e) {
					next(e);
					return;
				}
				let layout = layoutComponent;
				if (route.layout) {
					if (typeof route.layout === 'string') {
						layout = require(path.resolve(route.layout));
						if (layout.default) {
							layout = layout.default;
						}
					} else {
						// eslint-disable-next-line prefer-destructuring
						layout = route.layout;
					}
				}
				const data = {
					title: route.title,
					data: {
						user: req.session.getUser(),
						dev,
						timestamp: Date.now(),
						version: this._version,
					},
					layout,
				};
				if (typeof route.callback !== 'function') {
					res.renderLayout(data);
					return;
				}
				route.callback(req, res, (err, d = {}) => {
					if (err) {
						next(err);
						return;
					}
					res.renderLayout(_.merge(data, d));
				});
			});
		});
		this._createRoutingFile(componentsMap, cb);
	}

	/**
	 * Creates resources directory if doesn't exists.
	 * If the res directory doesn't contain text.json the file is created as well.
	 * @param {function(Error):void} cb Callback called after the directory is created.
	 */
	async _createResDir(cb) {
		const { appDir } = this._config;
		try {
			await this._validateDir(`${appDir}/res`, 'Creating RES directory.');
		} catch (e) {
			process.nextTick(() => cb(e));
			return;
		}
		this._createTextFiles(cb);
	}

	/**
	 * Creates all text files in the resources directory if don't exist.
	 *
	 * @param {function(Error): void} cb Callback after the file creation.
	 */
	_createTextFiles(cb) {
		const { appDir, locale } = this._config;
		async.eachSeries(locale.accepted, (acceptedLocale, callback) => {
			const fileName = this.getLocaleFileName(acceptedLocale);
			const filePath = `${appDir}/res/${fileName}`;
			fs.exists(filePath, (exists) => {
				if (exists) {
					callback();
					return;
				}
				this._log(`Creating text file ${fileName}`);
				fs.writeFile(filePath, '{}', callback);
			});
		}, cb);
	}

	_createNonceFile(cb) {
		this._log('Creating nonce file');
		fs.writeFile(
			`${this._getRSDirPath()}/nonce.js`,
			`__webpack_nonce__ = '${this._nonce}'`,
			cb,
		);
	}

	/**
	 * Creates the entry file required for the webpack.
	 *
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createEntryFile(cb) {
		this._log('Creating entry file');
		const {
			entryFile, appDir, connectSocketAutomatically, locale,
		} = this._config;
		const pathToTheModule = this._getPathToModule(path.resolve(this._getRSDirPath()));
		let entryFileImport = null;
		if (entryFile) {
			const pathToTheEntryFile = path.relative(path.resolve(this._getRSDirPath()), path.resolve(appDir, entryFile)).replace(/\\/g, '/');
			entryFileImport = `import '${pathToTheEntryFile.replace(/\.js/, '')}';`;
		}
		const errorPageImport = this._errorPage
			? `import ErrorPage from '${path.relative(path.resolve(this._getRSDirPath()), path.resolve(appDir, this._errorPage)).replace(/\\/g, '/')}';`
			: `import { ErrorPage } from '${pathToTheModule}'`;
		fs.writeFile(
			`${this._getRSDirPath()}/entry.js`,
			`import './nonce';
import Application, { Socket, Text } from '${pathToTheModule}';
${errorPageImport}
${entryFileImport || ''}
import routingMap from './router.map';
import socketEvents from './socket.map';
import components from './component.map';

// Import and register default dictionary.
import defaultDictionary from '../res/text.json';
Text.addDictionary(defaultDictionary);
// Import and register accepted locale dictionaries.
${locale.accepted.filter((l) => !this.isLocaleDefault(l)).map((l) => `Text.addDictionary('${l}', require('../res/${this.getLocaleFileName(l)}'));`).join('\n')}
// Set the dictionary from locale
let dictionary = 'default';
if (Application.getCookie(Application.LOCALE_COOKIE_NAME)) {
	dictionary = Application.getCookie(Application.LOCALE_COOKIE_NAME);
} else if (navigator && navigator.language) {
	dictionary = navigator.language;
}
Application.setLocale(dictionary);

// Register data to application and start it.
Application
	.registerRoutingMap(routingMap)
	.registerComponents(components)
	.registerErrorPage(ErrorPage)
	.start();
Socket.registerEvents(socketEvents);
${connectSocketAutomatically ? 'Socket.connect();' : ''}
// Injected code
${this._entryInjections.join('\n')}
`, cb,
		);
	}

	/**
	 * @typedef RouteMappings
	 * @property {string} title Title of the page.
	 * @property {string} spec Route spec of the page.
	 * @property {string} path Absolute path to the component.
	 */
	/**
	 * Creates the routing file for the front-end application.
	 *
	 * @param {Object.<string, RouteMappings>} map Map of the routes.
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createRoutingFile(map, cb) {
		const { createMissingComponents, generatedComponentsExtension } = this._config;
		this._log('Creating routing file');
		const a = [];
		const b = [];
		Object.keys(map).forEach((key) => {
			const route = map[key];
			if (!this._componentExists(route.path)) {
				this._warn(`Page ${route.path} doesn't exist.`, createMissingComponents ? 'GENERATING' : 'SKIPPING');
				if (!createMissingComponents) {
					return;
				}
				const dirName = path.dirname(route.path);
				mkdirp.sync(dirName);
				const fileName = path.basename(route.path);
				const filePath = `${route.path}.${generatedComponentsExtension}`;
				fs.writeFileSync(filePath, `import { Page } from '${this._getPathToModule(dirName)}';

export default class ${this._createClassName(fileName, 'Page')} extends Page {}
`);
			}
			const p = path.relative(path.resolve(this._getRSDirPath()), route.path).replace(/\\/g, '/');
			a.push(`import ${key} from '${p}';`);
			b.push(`{spec: '${route.spec}', component: ${key}, title: '${route.title}'}`);
		});
		const s = `${a.join('\n')}${'\n'}export default [${b.join(',')}];`;
		fs.writeFile(`${this._getRSDirPath()}/router.map.js`, s, cb);
	}

	/**
	 * Creates the file with custom components.
	 *
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createComponentsFile(cb) {
		const { createMissingComponents, generatedComponentsExtension } = this._config;
		this._log('Creating components file');
		const a = [];
		const b = [];
		this._components.forEach((component) => {
			if (!this._componentExists(component.path)) {
				this._warn(`Component ${component.path} doesn't exist.`, createMissingComponents ? 'GENERATING' : 'SKIPPING');
				if (!createMissingComponents) {
					return;
				}
				const dirName = path.dirname(component.path);
				mkdirp.sync(dirName);
				const fileName = path.basename(component.path);
				const filePath = `${component.path}.${generatedComponentsExtension}`;
				fs.writeFileSync(filePath, `import { Component } from '${this._getPathToModule(dirName)}';

export default class ${this._createClassName(fileName, 'Component')} extends Component {}
`);
			}
			const key = `__${md5(`${component.path}${component.elementId}}`)}__`;
			const p = path.relative(path.resolve(this._getRSDirPath()), component.path).replace(/\\/g, '/');
			a.push(`import ${key} from '${p}'`);
			b.push(`{elementId: '${component.elementId}', component: ${key}}`);
		});
		const s = `${a.join('\n')}${'\n'}export default [${b.join(',')}];`;
		fs.writeFile(`${this._getRSDirPath()}/component.map.js`, s, cb);
	}

	/**
	 * Creates the socket map for the front-end application.
	 *
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createSocketMap(cb) {
		this._log('Creating socket map');
		fs.writeFile(`${this._getRSDirPath()}/socket.map.js`, `export default [${this._socketEvents.map((e) => `'${e.event}'`).join(',')}];`, cb);
	}

	/**
	 * Creates the postcss config for the front-end application.
	 *
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createPostCSSConfig(cb) {
		this._log('Creating postcss config');
		fs.writeFile(
			`${this._getRSDirPath()}/postcss.config.js`,
			`module.exports={plugins:{autoprefixer:${JSON.stringify(this._config.autoprefixer)}}};`,
			cb,
		);
	}

	/**
	 * Creates tsconfig.json in the RS directory.
	 *
	 * @param {function(Error):void} cb Callback after the file is created in RS directory.
	 */
	_createTSConfig(cb) {
		this._log('Creating TS config');
		fs.writeFile(
			`${this._getRSDirPath()}/tsconfig.json`,
			JSON.stringify(TSConfig, null, 4),
			cb,
		);
	}

	// #endregion

	/**
	 * Compiles and merges all css and scss files in the module and app directories into one minified css file.
	 * Available only in production mode.
	 *
	 * @param {function(Error):void} cb Callback after the styles are compiled.
	 */
	_compileProductionStyles(cb) {
		const {
			dev, appDir, staticDir, cssDir,
		} = this._config;
		this._log('Compiling production styles', dev ? 'skipping' : undefined);
		if (dev) {
			cb();
			return;
		}
		const compiler = new StylesCompiler([
			path.resolve(__dirname, '../app'),
			path.resolve(appDir),
		], path.resolve(`${staticDir}/${cssDir}`));
		compiler.compile(cb);
	}

	/**
	 * Checks if the directory exists. If doesn't the directory is created.
	 *
	 * @param {string} dir Directory to check.
	 * @param {string} message Message shown if the directory is creating.
	 * @param {'log'|'warn'} level Log level of the message.
	 * @returns {Promise<void>}
	 */
	_validateDir(dir, message = null, level = 'log') {
		return new Promise((resolve, reject) => {
			fs.exists(dir, (exists) => {
				if (exists) {
					resolve();
					return;
				}
				const msg = message || `Directory ${dir} doesn't exist. Creating.`;
				switch (level) {
					case 'warn':
						this._warn(msg);
						break;
					default:
						this._log(msg);
				}
				mkdirp(dir, (err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		});
	}

	/**
	 * Starts the webpack and the express server. If the app is in dev mode the webpack watcher is started.
	 *
	 * @param {function} cb Callback to call after the server start.
	 */
	_start(cb) {
		const { dev, port } = this._config;
		if (dev) {
			this._compileStyles((err) => {
				if (err) {
					cb(err);
					return;
				}
				this._log('Starting webpack');
				let listening = false;
				// eslint-disable-next-line no-shadow
				this._webpack.watch({ aggregateTimeout: 300 }, (err, stats) => {
					if (err) {
						this._error(err);
						return;
					}
					if (listening) {
						// eslint-disable-next-line no-shadow
						this._compileStyles((err) => {
							if (err) {
								this._error(err);
							}
						});
					}
					this._log(stats.toJson('minimal'));
					Socket.broadcast('webpack.stats', stats.toJson('minimal'));
					if (!listening) {
						listening = true;
						this._server.listen(port, () => {
							this._log(`App listening on ${port}`);
							cb();
						});
					}
				});
			});
			return;
		}
		this._log('Starting webpack');
		// eslint-disable-next-line no-shadow
		this._webpack.run((err, stats) => {
			if (err) {
				cb(err);
				return;
			}
			const minimalStats = stats.toJson('minimal');
			this._log(minimalStats);
			const { errors } = minimalStats;
			if (errors && errors.length) {
				cb(new Error(`Webpack bundle cannot be created. ${errors.length} errors found.`, 'bundle', { errors }));
				return;
			}
			this._compileStyles((err) => {
				if (err) {
					cb(err);
					return;
				}
				this._server.listen(port, () => {
					this._log(`App listening on ${port}`);
					cb();
				});
			});
		});
	}

	/**
	 *
	 * @param {express.Request} req
	 * @param {express.Response} res
	 * @returns {Promise<void>}
	 */
	async _beforeCallback(req, res) {
		if (this._beforeExecution.length) {
			for (let i = 0; i < this._beforeExecution.length; i++) {
				const { spec, callback } = this._beforeExecution[i];
				if (spec === '*') {
					// eslint-disable-next-line no-await-in-loop
					await callback(req, res);
					// eslint-disable-next-line no-continue
					continue;
				}
				const r = new RouteParser(spec);
				const match = r.match(req.path);
				if (!match) {
					// eslint-disable-next-line no-continue
					continue;
				}
				// eslint-disable-next-line no-await-in-loop
				await callback(req, res);
			}
		}
	}

	/**
	 * Sets the express app and registers socket server.
	 */
	_setApp() {
		const { appDir, locale } = this._config;
		this._app = express();
		this._server = http.createServer(this._app);
		socket(this, {
			cookie: false,
			...this._config.socketIO,
		});
		try {
			Text.addDictionary(require(path.resolve(appDir, 'res', 'text.json')));
			locale.accepted
				.filter((l) => l !== locale.default)
				.forEach((acceptedLocale) => Text.addDictionary(
					acceptedLocale,
					require(path.resolve(appDir, 'res', this.getLocaleFileName(acceptedLocale))),
				));
		} catch (e) {
			this._warn(e.message);
		}
	}

	/**
	 * Registers middlewares to the express instance.
	 *
	 * @param {boolean} afterRoutes If true the middlewares are registered after the routes registration.
	 */
	_setMiddlewares(afterRoutes = false) {
		const {
			staticDir, cookies,
		} = this._config;
		const { secret } = cookies;
		if (!afterRoutes) {
			this._app.use(express.static(staticDir));
			this._app.use(cookieParser(secret));
			this._app.use(compression());
			this._app.use(SessionMiddleware(this));
			this._app.use(LocaleMiddleware(this));
			this._app.use(RenderMiddleware(this));
			this._app.use(AuthMiddleware(this));
			this._middlewares
				// eslint-disable-next-line no-shadow
				.filter(({ afterRoutes }) => !afterRoutes)
				.forEach(({ callback }) => this._app.use(callback(this)));
			return;
		}
		this._middlewares
			// eslint-disable-next-line no-shadow
			.filter(({ afterRoutes }) => afterRoutes)
			.forEach(({ callback }) => this._app.use(callback(this)));
		this._app.use('*', PageNotFoundMiddleware());
		this._app.use(ErrorMiddleware(this));
	}

	/**
	 * Combines all css files in css directory to rs-app.css in css directory.
	 *
	 * @param {function(Error):void} cb Callback after the compilation is finished.
	 */
	_compileStyles(cb = () => { }) {
		this._log('Compiling styles');
		const {
			cssDir, staticDir, mergeStyles, sourceStylesDir,
		} = this._config;
		const dir = path.resolve(`${staticDir}/${cssDir}`);
		const stylesPath = `${dir}/rs-app.css`;
		if (fs.existsSync(stylesPath)) {
			fs.unlinkSync(stylesPath);
		}
		const compiler = new StylesCompiler([
			path.resolve(__dirname, './assets/loader.scss'),
			...mergeStyles,
			sourceStylesDir,
		], dir, 'rs-app.css');
		compiler.compile((err) => {
			if (err) {
				cb(err);
				return;
			}
			const files = fs.readdirSync(dir);
			try {
				files.forEach((file) => {
					if (file.indexOf('rs-tmp') >= 0) {
						fs.unlinkSync(`${dir}/${file}`);
					}
					if (file.indexOf('cs-tmp') >= 0) {
						fs.unlinkSync(`${dir}/${file}`);
					}
				});
			} catch (e) {
				this._error(e);
			}
			fs.readFile(stylesPath, (err, css) => {
				if (err) {
					cb(err);
					return;
				}
				postcss([autoprefixer(this._config.autoprefixer)])
					.process(css, { from: stylesPath })
					.then((result) => {
						fs.writeFile(stylesPath, result.css, cb);
					}).catch((err) => {
						process.nextTick(() => cb(err));
					});
			});
		});
	}

	/**
	 * Gets the relative path to the RS directory.
	 *
	 * @returns {string}
	 */
	_getRSDirPath() {
		const { appDir } = this._config;
		return `${appDir}/${RS_DIR}`;
	}

	/**
	 * Gets the absolute path to the RS directory.
	 *
	 * @returns {string}
	 */
	_getRSDirPathAbsolute() {
		return path.resolve(this._getRSDirPath());
	}

	/**
	 * Checks if component exists. If the path doesn't contain extension js(x) and ts(x) extensions are tried.
	 *
	 * @param {string} filePath Absolute path to the component.
	 * @param {boolean} tryIndexFile Indicates if the component should be checked within the index file in directory.
	 */
	_componentExists(filePath, tryIndexFile = true) {
		if (path.extname(filePath)) {
			return fs.existsSync(filePath);
		}
		let exists = false;
		['js', 'jsx', 'ts', 'tsx'].forEach((ext) => {
			if (exists) {
				return;
			}
			exists = fs.existsSync(`${filePath}.${ext}`);
		});
		if (!exists && tryIndexFile) {
			return this._componentExists(path.resolve(filePath, 'index'), false);
		}
		return exists;
	}

	/**
	 * Gets the path to the module depending on the module development status.
	 */
	_getPathToModule(sourceDir) {
		const { moduleDev } = this._config;
		return moduleDev
			? path.relative(sourceDir, path.resolve('./src/app')).replace(/\\/g, '/')
			: 'reacting-squirrel';
	}

	/**
	 * Creates class name from the string.
	 *
	 * @param {string} s
	 * @param {string} suffix
	 */
	_createClassName(s, suffix = '') {
		return this._capitalizeFirstLetter(s).replace(/\./g, '_').replace(/-/g, '_') + suffix;
	}

	/**
	 * Capitalizes first letter.
	 *
	 * @param {string} s String to capitalize.
	 */
	_capitalizeFirstLetter(s) {
		if (s.length < 1) {
			return null;
		}
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	/**
	 * Gets the config from rsconfig file.
	 */
	_getConfigFromRSConfig() {
		if (!this._rsConfig) {
			return {};
		}
		const {
			routes, components, socketClassDir, errorPage, ...config
		} = this._rsConfig;
		const {
			layoutComponent, session, auth, errorHandler, onWebpackProgress, webpack, mergeStyles, ...restConfig
		} = config;
		return {
			...restConfig,
			layoutComponent: layoutComponent ? this._tryRequireModule(layoutComponent) : undefined,
			session: session ? this._tryRequireModule(session) : undefined,
			auth: auth ? this._tryRequireModule(auth) : undefined,
			errorHandler: errorHandler ? this._tryRequireModule(errorHandler) : undefined,
			onWebpackProgress: onWebpackProgress ? this._tryRequireModule(onWebpackProgress) : undefined,
			// eslint-disable-next-line no-nested-ternary
			webpack: webpack
				? typeof webpack === 'string'
					? this._tryRequireModule(webpack)
					: webpack
				: undefined,
			mergeStyles: mergeStyles && mergeStyles.length
				? mergeStyles.map((style) => path.resolve(style))
				: undefined,
		};
	}

	_getLocaleText(locale, key, ...args) {
		if (this.isLocaleDefault(locale)) {
			return Text.getFromDictionary('default', key, ...args);
		}
		return Text.getFromDictionary(locale, key, ...args) || Text.getFromDictionary('default', key, ...args);
	}

	/**
	 * Tries to require file.
	 *
	 * @param {string} filePath Path to the file to require.
	 * @param {boolean} resolve Indicates if `path.resolve` should be used on the filePath.
	 */
	_tryRequireModule(filePath, resolve = true) {
		if (!filePath) {
			return null;
		}
		try {
			const m = require(resolve ? path.resolve(filePath) : filePath);
			return m.default || m;
		} catch (e) {
			this._warn(e);
			return null;
		}
	}

	/**
	 * Logs the message to the console if the app is in the dev mode.
	 *
	 * @param {string} message Message to log.
	 */
	_log(message, ...args) {
		const { dev } = this._config;
		if (!dev) {
			return;
		}
		// eslint-disable-next-line no-console
		console.log(new Date(), '[INFO]', message, ...args);
	}

	/**
	 * Logs the warning message to the console.
	 *
	 * @param {string} message Message to log.
	 */
	_warn(message, ...args) {
		// eslint-disable-next-line no-console
		console.warn(new Date(), '[WARN]', message, ...args);
	}

	_error(message, ...args) {
		// eslint-disable-next-line no-console
		console.error(new Date(), '[ERROR]', message, ...args);
	}
}

export {
	Server as default,
	Session,
	Layout,
	SocketClass,
	HttpError,
	Socket,
	Utils,
	Plugin,
};
