/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import '@babel/polyfill';
import express from 'express';
import http from 'http';
import webpack from 'webpack';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import cookieParser from 'cookie-parser';
import cookieSignature from 'cookie-signature';
import md5 from 'md5';
import fs from 'fs';
import async from 'async';
import Error from 'smart-error';
import HttpError from 'http-smart-error';
import compression from 'compression';
import readline from 'readline';
import ExtraWatchWebpackPlugin from 'extra-watch-webpack-plugin';
import mkdirp from 'mkdirp';
import _ from 'lodash';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

import Layout from './layout';
import Session from './session';
import Route from './route';
import socket, { Socket } from './socket';
import SocketClass from './socket-class';
import Utils from './utils';
import StylesCompiler from './styles-compiler';
import { TSConfig } from './constants';

const RS_DIR = '~rs';

/**
 * Server part of the application.
 */
class Server {

	/**
	 * @callback AuthCallback
	 */
	/**
	 * @typedef SocketEvent
	 * @property {string} event
	 * @property {function} listener
	 */
	/**
	 * @typedef CustomComponent
	 * @property {string} path Absolute path to the component.
	 * @property {string} elementId Identificator of the DOM element where the component should render.
	 */
	/**
	 * @typedef AppConfig
	 * @property {number} port Port on which the app listens.
	 * @property {string} staticDir Relative path to the static directory for the express app.
	 * @property {boolean} dev Flag of the dev status of the app.
	 * @property {string} jsDir Name of the directory where the javascript is located in the staticDir.
	 * @property {string} cssDir Name of the directory where the css is located in the staticDir.
	 * @property {string} filename Name of the file.
	 * @property {string} appDir Relative path to the app directory.
	 * @property {string} entryFile Relative path to the entry file.
	 * @property {string} rsConfig Custom path to rsconfig.json file.
	 * @property {JSX.Element} layoutComponent React component with default html code. It must extend Layout from the module.
	 * @property {string} cookieSecret Secret which is used to sign cookies.
	 * @property {string[]} scripts List of the scripts loaded in the base html.
	 * @property {string[]} styles List of the styles loaded in the base html.
	 * @property {string[]} mergeStyles List of styles to merge to rs-app.css.
	 * @property {function} session Class of the session. It must extend Session from the module.
	 * @property {function} socketMessageMaxSize Maximal size of one socket message.
	 * @property {function(Session, AuthCallback):void} auth Auth function called on the routes which are requiring authorization.
	 * @property {function} errorHandler Function to handle errors in the route execution.
	 * @property {boolean} bundlePathRelative Indicates if the bundle is loaded relatively in the output html.
	 * @property {function(percents, message):void} onWebpackProgress Function to handle webpack progress.
	 * @property {any} socketIO Custom socketio config.
	 * @property {any} webpack Custom webpack config.
	 * @property {any} autoprefixer Autoprefixer config.
	 */

	/**
	 * Express app instance.
	 * @type {any}
	 */
	_app = null;

	_server = null;

	_webpack = null;

	/** @type {Route[]} */
	_routes = [];

	/** @type Object.<string, Route> */
	_routeCallbacks = {};

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
		cookieSecret: Math.random().toString(36).substring(7),
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
		moduleDev: false,
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

	/**
	 * Creates the instance of the server and prepares express app with socket.io.
	 *
	 * @param {AppConfig} config
	 */
	constructor(config = {}) {
		if (!config.cookieSecret) {
			this._warn('Using default cookieSecret. It\'s a random string which changes every server start. It should be overriden in config.\n');
		}
		this._config = {
			...this._config,
			...config,
		};
		if (!(new this.Session() instanceof Session)) {
			throw new Error('Cannot create instance of Session.');
		}
		if (!(new this.Layout() instanceof Layout)) {
			throw new Error('Cannot create instance of Layout.');
		}
		this._path = path.resolve(`${this._config.staticDir}/${this._config.jsDir}`);
		try {
			this._rsConfig = require(this._config.rsConfig || path.resolve('./rsconfig.json'));
		} catch (e) {
			if (this._config.rsConfig) {
				throw e;
			}
		}
		this._bundlePath = `${this._config.bundlePathRelative
			? ''
			: '/'}${this._config.jsDir}/${this._config.filename}`;
		const pkg = require(path.resolve('./package.json'));
		this._version = pkg.version;
		this._setApp();
		this._log(`Server created ${JSON.stringify(this._config)}`);
	}

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

	/**
	 * Starts the express server. In that process it creates all necessary files.
	 *
	 * @param {function=} cb Callback to call after the server start.
	 */
	async start(cb = () => { }) {
		const { dev } = this._config;
		this._log(`App starting DEV: ${dev}`);
		this._registerRsConfig();
		try {
			await this._createRSFiles();
		} catch (e) {
			process.nextTick(() => cb(e));
			return;
		}
		this._setWebpack();
		this._setMiddlewares(true);
		this._start(cb);
	}

	_registerRsConfig() {
		if (this._rsConfig) {
			const { routes, components, socketClassDir } = this._rsConfig;
			if (routes) {
				Utils.registerRoutes(this, routes.map(route => (
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
		}
	}

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
		const { dev, appDir, layoutComponent } = this._config;
		const componentsMap = {};
		this._routes.forEach((route) => {
			this._app[route.method](route.spec, (req, res, next) => {
				if (route.requireAuth && req.session.getUser() === null) {
					next(HttpError.create(401));
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
					res.render(data);
					return;
				}
				route.callback(req, res, (err, d = {}) => {
					if (err) {
						next(err);
						return;
					}
					res.render(_.merge(data, d));
				});
			});
			if (route.contentComponent) {
				const key = `__${md5(`${route.type}${route.spec}`)}__`;
				const modulePath = path.resolve(`${appDir}/${route.contentComponent}`);
				componentsMap[key] = {
					title: route.title,
					spec: route.spec,
					path: modulePath,
				};
			}
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
		this._createDefaultTextFile(cb);
	}

	/**
	 * Creates text.json file in resources directory if it doesn't exist.
	 *
	 * @param {function(Error):void} cb Callback after the text file creation.
	 */
	_createDefaultTextFile(cb) {
		const { appDir } = this._config;
		const filePath = `${appDir}/res/text.json`;
		fs.exists(filePath, (exists) => {
			if (exists) {
				cb();
				return;
			}
			this._log('Creating default text file');
			fs.writeFile(filePath, '{}', cb);
		});
	}

	/**
	 * Creates the entry file required for the webpack.
	 *
	 * @param {function(Error):void} cb Callback to call after the creation process.
	 */
	_createEntryFile(cb) {
		this._log('Creating entry file');
		const { moduleDev, entryFile, appDir } = this._config;
		const pathToTheModule = moduleDev
			? path.relative(path.resolve(this._getRSDirPath()), path.resolve('./src/app')).replace(/\\/g, '/')
			: 'reacting-squirrel';
		let entryFileImport = null;
		if (entryFile) {
			const pathToTheEntryFile = path.relative(path.resolve(this._getRSDirPath()), path.resolve(appDir, entryFile)).replace(/\\/g, '/');
			entryFileImport = `import '${pathToTheEntryFile.replace(/\.js/, '')}';`;
		}
		fs.writeFile(
			`${this._getRSDirPath()}/entry.js`,
			`import Application, { Socket, Text } from '${pathToTheModule}';
${entryFileImport || ''}
import routingMap from './router.map';
import socketEvents from './socket.map';
import components from './component.map';

import defaultDictionary from '../res/text.json';

Text.addDictionary(defaultDictionary);

Application
			.registerRoutingMap(routingMap)
			.registerComponents(components)
			.start();
Socket
			.registerEvents(socketEvents)
			.connect();
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
		this._log('Creating routing file');
		const a = [];
		const b = [];
		Object.keys(map).forEach((key) => {
			const route = map[key];
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
		this._log('Creating components file');
		const a = [];
		const b = [];
		this._components.forEach((component) => {
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
		fs.writeFile(`${this._getRSDirPath()}/socket.map.js`, `export default [${this._socketEvents.map(e => `'${e.event}'`).join(',')}];`, cb);
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
		this._log('Starting webpack');
		const { dev, port, onWebpackProgress } = this._config;
		let webpackDone = false;
		const p = new webpack.ProgressPlugin((percentage, message, ...args) => {
			if (!webpackDone) {
				if (typeof onWebpackProgress === 'function') {
					onWebpackProgress(percentage, message);
				} else if (dev) {
					this._webpackProgress(percentage, message);
				}
				if (percentage === 1) {
					webpackDone = true;
				}
			}
		});
		p.apply(this._webpack);
		if (dev) {
			let listening = false;
			this._webpack.watch({ aggregateTimeout: 300 }, (err, stats) => {
				if (err) {
					this._error(err);
					return;
				}
				this._compileStyles((err) => {
					if (err) {
						this._error(err);
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
			// eslint-disable-next-line no-shadow
			this._compileStyles((err) => {
				if (err) {
					cb(err);
				}
				this._server.listen(port, () => {
					this._log(`App listening on ${port}`);
					cb();
				});
			});
		});
	}

	/**
	 * Sets the express app, webpack and registers socket server.
	 */
	_setApp() {
		this._app = express();
		this._setMiddlewares();
		this._server = http.createServer(this._app);
		// this._setWebpack();
		socket(this, this._config.socketIO);
	}

	/**
	 * Creates the webpack instance.
	 */
	_setWebpack() {
		const {
			dev, filename, staticDir, cssDir,
		} = this._config;
		const { plugins, ...config } = this._config.webpack;
		const postCSSLoader = {
			loader: 'postcss-loader',
			options: {
				config: {
					path: `${this._getRSDirPath()}/postcss.config.js`,
				},
			},
		};
		const prodStyleLoader = {
			loader: 'prod-style-loader',
			options: {
				outDir: path.resolve(`${staticDir}/${cssDir}`),
			},
		};
		this._webpack = webpack({
			mode: dev ? 'development' : 'production',
			entry: ['@babel/polyfill', `${this._getRSDirPath()}/entry.js`],
			output: {
				path: this._path,
				filename,
			},
			resolve: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
			resolveLoader: {
				alias: {
					'prod-style-loader': path.resolve(__dirname, './style-loader'),
				},
			},
			module: {
				rules: [
					{
						test: /\.js?$/,
						exclude: /node_modules/,
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react'],
							plugins: [
								'@babel/plugin-transform-async-to-generator',
								['@babel/plugin-proposal-decorators', { legacy: true }],
							],
						},
					},
					{
						test: /\.js$/,
						include: [
							new RegExp(`node_modules\\${path.sep}debug`),
						],
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
					{
						test: /\.ts$|\.tsx$/,
						// exclude: /node_modules/,
						loader: 'ts-loader',
						options: {
							configFile: '~rs/tsconfig.json',
						},
					},
					{
						test: /\.css?$/,
						use: dev ? [
							'style-loader',
							'css-loader',
							postCSSLoader,
						] : prodStyleLoader,
					},
					{
						test: /\.scss?$/,
						use: dev ? [
							'style-loader',
							'css-loader',
							postCSSLoader,
							'sass-loader',
						] : prodStyleLoader,
					},
				],
			},
			target: 'web',
			devtool: dev ? 'source-map' : undefined,
			plugins: [
				new ExtraWatchWebpackPlugin({
					files: this._getStylesToWatch(),
				}),
			].concat(plugins || []),
			...config,
		});
	}

	/**
	 * Registers middlewares to the express instance.
	 *
	 * @param {boolean} afterRoutes If true the middlewares are registered after the routes registration.
	 */
	_setMiddlewares(afterRoutes = false) {
		const {
			staticDir, cookieSecret, session, layoutComponent, dev, errorHandler, cssDir,
		} = this._config;
		if (!afterRoutes) {
			// const LayoutComponent = layoutComponent;
			this._app.use(express.static(staticDir));
			this._app.use(cookieParser(cookieSecret));
			this._app.use(compression());
			this._app.use((req, res, next) => {
				let sessionId;
				const setSession = () => {
					sessionId = session.generateId();
					res.cookie('session_id', cookieSignature.sign(sessionId, cookieSecret));
				};
				if (!req.cookies.session_id) {
					this._log('Session id not found. Generating.');
					setSession();
				} else {
					sessionId = cookieSignature.unsign(req.cookies.session_id, cookieSecret);
					if (!sessionId) {
						this._log('Session secret not match. Generating.');
						setSession();
					}
				}
				req.session = new this.Session(sessionId);
				res.render = ({
					scripts, styles, data, title, layout,
				}) => {
					const LayoutComponent = layout || layoutComponent;
					res.setHeader('Content-Type', 'text/html; charset=utf-8');
					res.end(`<!DOCTYPE html>${ReactDOMServer.renderToString(<LayoutComponent
						scripts={this._config.scripts.concat(scripts || [])}
						styles={this._config.styles.concat(styles || [`/${cssDir}/rs-app.css`])}
						initialData={data || {}}
						title={title}
						user={req.user}
						version={this._version}
						bundle={this._bundlePath}
						url={{
							protocol: req.protocol,
							hostname: req.get('host'),
							pathname: req.originalUrl,
						}}
					/>)}`);
				};
				this.auth(req.session, next);
			});
			return;
		}

		this._app.use('*', (req, res, next) => {
			next(HttpError.create(404, 'Page not found'));
		});
		this._app.use((err, req, res, next) => {
			if (!(err instanceof HttpError)) {
				if (typeof err === 'string') {
					// eslint-disable-next-line no-param-reassign
					err = { message: err };
				}
				const { message, code, ...payload } = err;
				// eslint-disable-next-line no-param-reassign
				err = HttpError.create(err.statusCode || 500, message, code, Error.parsePayload(payload));
			}
			if (res.statusCode === 200) {
				res.status(err.statusCode);
			}
			this._error(err);
			const render = () => {
				res.render({
					title: err.message,
					data: {
						user: req.session.getUser(),
						dev,
						timestamp: Date.now(),
						error: err.toJSON(dev),
						version: this._version,
					},
				});
			};
			if (typeof errorHandler !== 'function') {
				render();
				return;
			}
			errorHandler(err, req, res, () => render());
		});
	}

	/**
	 * Logs the webpack progress in stdout.
	 *
	 * @param {number} percentage Current progress of webpack processing.
	 * @param {string} message Current message of webpack processing.
	 */
	_webpackProgress(percentage, message) {
		readline.cursorTo(process.stdout, 0);
		process.stdout.write(`Webpack: ${(percentage * 100).toFixed(2)}% ${message}`);
		readline.clearLine(process.stdout, 1);
		if (percentage === 1) {
			process.stdout.write('\n');
		}
	}

	/**
	 * Combines all css files in css directory to rs-app.css in css directory.
	 *
	 * @param {function(Error):void} cb Callback after the compilation is finished.
	 */
	_compileStyles(cb = () => { }) {
		this._log('Compiling styles');
		const { cssDir, staticDir, mergeStyles } = this._config;
		const dir = path.resolve(`${staticDir}/${cssDir}`);
		const stylesPath = `${dir}/rs-app.css`;
		if (fs.existsSync(stylesPath)) {
			fs.unlinkSync(stylesPath);
		}
		const compiler = new StylesCompiler([...mergeStyles, dir], dir, 'rs-app.css');
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
	 * Gets the list of css or scss files in css directory for webpack watch registration.
	 */
	_getStylesToWatch() {
		const { staticDir, cssDir } = this._config;
		const dir = path.resolve(`${staticDir}/${cssDir}`);
		const files = fs.readdirSync(dir);
		return files
			.map(f => `${dir}/${f}`)
			.filter((f) => {
				const stat = fs.statSync(f);
				if (stat.isDirectory()) {
					// TODO nested
					return false;
				}
				if (f.indexOf('rs-') >= 0) {
					return false;
				}
				return ['.css', '.scss'].includes(path.extname(f));
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
	 * Logs the message to the console if the app is in the dev mode.
	 *
	 * @param {string} message Message to log.
	 */
	_log(message) {
		const { dev } = this._config;
		if (!dev) {
			return;
		}
		// eslint-disable-next-line no-console
		console.log(new Date(), message);
	}

	/**
	 * Logs the warning message to the console.
	 *
	 * @param {string} message Message to log.
	 */
	_warn(message) {
		// eslint-disable-next-line no-console
		console.warn(new Date(), message);
	}

	_error(message) {
		// eslint-disable-next-line no-console
		console.error(new Date(), message);
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
};
