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

import Layout from './layout';
import Session from './session';
import Route from './route';
import socket from './socket';
import SocketClass from './socket-class';

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
     * @property {string} filename Name of the file.
     * @property {string} appDir Relative path to the app directory.
     * @property {JSX.Element} layoutComponent React component with default html code. It must extend Layout from the module.
     * @property {string} cookieSecret Secret which is used to sign cookies.
     * @property {string[]} scripts List of the scripts loaded in the base html.
     * @property {string[]} styles List of the styles loaded in the base html.
     * @property {function} session Class of the session. It must extend Session from the module.
     * @property {function(Session, AuthCallback):void} auth Auth function called on the routes which are requiring authorization.
     * @property {any} webpack Custom webpack config.
     */

    /**
     * Express app instance.
     * @type {any}
     * */
    _app = null;
    _server = null;
    _webpack = null;
    /** @type {Route[]} */
    _routes = [];
    /** @type {AppConfig} */
    _config = {
        port: 8080,
        staticDir: './public',
        dev: false,
        jsDir: 'js',
        filename: 'bundle.js',
        appDir: './app',
        layoutComponent: Layout,
        cookieSecret: Math.random().toString(36).substring(7),
        scripts: [],
        styles: [],
        session: Session,
        auth: (session, next) => next(),
        webpack: {},
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

    _socketEvents = [];
    _socketClasses = [];
    /** @type {CustomComponent[]} */
    _components = [];

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
            console.warn('Using default cookieSecret. It\'s a random string which changes every server start. It should be overriden in config.\n');
        }
        this._config = {
            ...this._config,
            ...config,
        };
        if (!(new this._config.session() instanceof Session)) {
            throw new Error('Cannot create instance of Session.');
        }
        if (!(new this._config.layoutComponent() instanceof Layout)) {
            throw new Error('Cannot create instance of Layout.');
        }
        this._path = path.resolve(`${this._config.staticDir}/${this._config.jsDir}`);
        this._bundlePath = `/${this._config.jsDir}/${this._config.filename}`;
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
        this.registerRoute('get', route, contentComponent, title, requireAuth, callback);
    }

    /**
     * Registers the route.
     *
     * @param {'get'|'post'|'put'|'delete'} method HTTP method of the route.
     * @param {string} route Route spec.
     * @param {string} contentComponent Relative path from the {config.appDir} to the component.
     * @param {string} title Title of the page.
     * @param {boolean=} requireAuth If true the route requires authorized user.
     * @param {function=} callback Callback to call when the route is called.
     */
    registerRoute(method, route, contentComponent, title, requireAuth, callback) {
        this._routes.push(new Route(method, route, contentComponent, title, requireAuth, callback));
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
    }

    /**
     * Registers the socket event.
     *
     * @param {string} event Name of the event.
     * @param {function} listener Listener to call after the socket request.
     */
    registerSocketEvent(event, listener) {
        this._socketEvents.push({ event, listener });
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
    }

    /**
     * Starts the express server. In that process it creates all necessary files.
     *
     * @param {function=} cb Callback to call after the server start.
     */
    start(cb = () => { }) {
        const {
            dev, layoutComponent, cookieSecret, session,
        } = this._config;
        this._log(`App starting DEV: ${dev}`);
        const LayoutComponent = layoutComponent;
        this._app.use(cookieParser(cookieSecret));
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
            req.session = new session(sessionId);
            res.render = ({
                scripts, styles, data, title,
            }) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(ReactDOMServer.renderToString(<LayoutComponent
                    scripts={this._config.scripts.concat(scripts || [])}
                    styles={this._config.styles.concat(styles || [])}
                    initialData={data || {}}
                    title={title}
                    user={req.user}
                    version={this._version}
                    bundle={this._bundlePath}
                />));
            };
            this.auth(req.session, next);
        });
        this._createRSFiles((err) => {
            if (err) {
                console.error(err);
                return;
            }
            this._app.use('*', (req, res, next) => {
                // TODO error
                res.status(404);
                next('Page not found');
            });
            this._app.use((err, req, res, next) => {
                if (!(err instanceof Error)) {
                    err = new Error(err);
                }
                console.error(err);
                if (res.statusCode === 200) {
                    res.status(500);
                }
                res.render({
                    title: err.message,
                    data: {
                        user: req.session.getUser(),
                        dev,
                        error: err.toJSON(dev),
                    },
                });
            });
            this._start(cb);
        });
    }

    /**
     * Creates the resting-squirrel files.
     *
     * @param {function(Error):void} cb Callback to call after the creation process.
     */
    _createRSFiles(cb) {
        this._log('Creating RS files');
        this._validateAppDir((err) => {
            if (err) {
                cb(err);
                return;
            }
            this._validateRSDir((err) => {
                if (err) {
                    cb(err);
                    return;
                }
                async.each([
                    '_createEntryFile',
                    '_setRoutes',
                    '_createComponentsFile',
                    '_createSocketMap',
                    '_createPostCSSConfig',
                ], (f, callback) => this[f].call(this, callback), cb);
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
        const { dev, appDir } = this._config;
        const componentsMap = {};
        this._routes.forEach((route) => {
            this._app[route.method](route.spec, (req, res, next) => {
                // TODO auth
                if (route.requireAuth && req.session.getUser() === null) {
                    res.status(401);
                    next(new Error('Unauthorized request'));
                    return;
                }
                let data = {
                    title: route.title,
                    data: {
                        user: req.session.getUser(),
                        dev,
                    },
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
                    data = {
                        ...data,
                        ...d,
                    };
                    res.render(data);
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
     * Creates the entry file required for the webpack.
     *
     * @param {function(Error):void} cb Callback to call after the creation process.
     */
    _createEntryFile(cb) {
        this._log('Creating entry file');
        const { moduleDev } = this._config;
        const pathToTheModule = moduleDev
            ? path.relative(path.resolve(this._getRSDirPath()), path.resolve('./src/app')).replace(/\\/g, '/')
            : 'reacting-squirrel';
        fs.writeFile(
            `${this._getRSDirPath()}/entry.js`,
            `import { Application } from '${pathToTheModule}';
import routingMap from './router.map';
import socketEvents from './socket.map';
import components from './component.map';

Application
            .registerSocketEvents(socketEvents)
            .registerRoutingMap(routingMap)
            .registerComponents(components)
            .start();
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
        fs.writeFile(`${this._getRSDirPath()}/postcss.config.js`, 'module.exports={plugins:{autoprefixer: {}}};', cb);
    }

    /**
     * Checks if the {config.appDir} exists. If not the directory is created.
     *
     * @param {function(Error):void} cb Callback to call after the creation process.
     */
    _validateAppDir(cb) {
        const { appDir } = this._config;
        fs.exists(appDir, (exists) => {
            if (exists) {
                cb();
                return;
            }
            this._warn('App directory doesn\'t exist. Creating.');
            fs.mkdir(appDir, cb);
        });
    }

    /**
     * Checks if the RS directory exists. If not the directory is created.
     *
     * @param {function(Error):void} cb Callback to call after the creation process.
     */
    _validateRSDir(cb) {
        fs.exists(this._getRSDirPath(), (exists) => {
            if (exists) {
                cb();
                return;
            }
            this._log('Creating RS directory.');
            fs.mkdir(this._getRSDirPath(), cb);
        });
    }

    /**
     * Starts the webpack and the express server. If the app is in dev mode the webpack watcher is started.
     *
     * @param {function} cb Callback to call after the server start.
     */
    _start(cb) {
        this._log('Starting webpack');
        const { dev, port } = this._config;
        if (dev) {
            let listening = false;
            this._webpack.watch({ aggregateTimeout: 300 }, (err, stats) => {
                if (err) {
                    console.error(err);
                    return;
                }
                this._log(stats.toJson('minimal'));
                if (!listening) {
                    listening = true;
                    this._server.listen(port, () => {
                        this._log(`App listening on ${port}`);
                        cb();
                    });
                }
            });
            return;
        }
        this._webpack.run((err, stats) => {
            if (err) {
                console.error(err);
                return;
            }
            this._log(stats.toJson('minimal'));
            this._server.listen(port, () => {
                this._log(`App listening on ${port}`);
                cb();
            });
        });
    }

    /**
     * Sets the express app, webpack and registers socket server.
     */
    _setApp() {
        this._app = express();
        this._app.use(express.static(this._config.staticDir));
        this._server = http.createServer(this._app);
        this._setWebpack();
        socket(this);
    }

    /**
     * Creates the webpack instance.
     */
    _setWebpack() {
        const { dev, filename } = this._config;
        const postCSSLoader = {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: `${this._getRSDirPath()}/postcss.config.js`,
                },
            },
        };
        this._webpack = webpack({
            mode: dev ? 'development' : 'production',
            entry: `${this._getRSDirPath()}/entry.js`,
            output: {
                path: this._path,
                filename,
            },
            module: {
                rules: [
                    {
                        test: /\.js?$/,
                        /* include: [
                            path.resolve(__dirname, 'app')
                        ], */
                        loader: 'babel-loader',
                        options: {
                            presets: ['stage-2', 'react'],
                        },
                    },
                    {
                        test: /\.css?$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            postCSSLoader,
                        ],
                    },
                    {
                        test: /\.scss?$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            postCSSLoader,
                            'sass-loader',
                        ],
                    },
                ],
            },
            target: 'web',
            devtool: dev ? 'source-map' : undefined,
            ...this._config.webpack,
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
        console.log(new Date(), message);
    }

    /**
     * Logs the warning message to the console.
     *
     * @param {string} message Message to log.
     */
    _warn(message) {
        console.warn(new Date(), message);
    }
}

export {
    Server as default,
    Session,
    Layout,
    SocketClass,
};
