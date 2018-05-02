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
import argsParser from 'args-parser';

import Layout from './layout';
import Session from './session';
import Route from './route';
import socket from './socket';
import SocketClass from './socket-class';

const args = argsParser(process.argv);

const RS_DIR = '~rs';

class Server {

    /**
     * @callback AuthCallback
     */
    /**
     * @typedef AppConfig
     * @property {number} port
     * @property {string} static
     * @property {boolean} dev
     * @property {string} jsDir
     * @property {string} filename
     * @property {string} appDir
     * @property {JSXElement} layoutComponent
     * @property {string} cookieSecret
     * @property {string[]} scripts
     * @property {string[]} styles
     * @property {boolean} log
     * @property {Function<Session>} session
     * @property {function(Session, AuthCallback):void} auth
     * @property {any} webpack
     */

    /** @type {any} Express app instance. */
    _app = null;
    _server = null;
    _webpack = null;
    /** @type {Route[]} */
    _routes = [];
    /** @type {AppConfig} */
    _config = {
        port: 8080,
        static: './public',
        dev: false,
        jsDir: 'js',
        filename: 'bundle.js',
        appDir: './app',
        layoutComponent: Layout,
        cookieSecret: Math.random().toString(36).substring(7),
        scripts: [],
        styles: [],
        log: false,
        session: Session,
        auth: (session, next) => next(),
        webpack: {},
    };

    _version = null;

    _socketEvents = [];
    _socketClasses = [];

    get Session() {
        return this._config.session;
    }

    /**
     *
     * @param {AppConfig} config
     */
    constructor(config) {
        if (!config.cookieSecret) {
            console.warn('Using default cookieSecret. It\' a random string which changes every server start. It should be overriden in config.\n');
        }
        this._config = {
            ...this._config,
            ...config,
        };
        if (!(new this._config.session() instanceof Session)) {
            throw new Error('Cannot create instance of Session.');
        }
        if (!(new this._config.layoutComponent() instanceof Layout)) {
            throw new Error('Cannot create instance of Layout');
        }
        this._config.path = path.resolve(`${this._config.static}/${this._config.jsDir}`);
        this._config.bundlePath = `/${this._config.jsDir}/${this._config.filename}`;
        const pkg = require(path.resolve('./package.json'));
        this._version = pkg.version;
        this._setApp();
        this._log(`Server created ${JSON.stringify(this._config)}`);
    }

    getServer() {
        return this._server;
    }

    getSocketEvents() {
        return this._socketEvents;
    }

    getSocketClasses() {
        return this._socketClasses;
    }

    auth(session, next) {
        this._config.auth(session, next);
    }

    get(route, contentComponent, title, callback) {
        this.registerRoute('get', route, contentComponent, title, callback);
    }

    registerRoute(method, route, contentComponent, title, callback) {
        this._routes.push(new Route(method, route, contentComponent, title, false, callback));
    }

    registerSocketClass(Cls) {
        const instance = new Cls();
        if (!(instance instanceof SocketClass)) {
            throw new Error(`${Cls} must be inherited from SocketClass`);
        }
        instance.getEvents().forEach(({ event, listener }) => this.registerSocketEvent(event, listener));
        this._socketClasses.push(instance);
    }

    registerSocketEvent(event, listener) {
        this._socketEvents.push({ event, listener });
    }

    start(cb = () => { }) {
        const {
            dev, layoutComponent, cookieSecret, session, bundlePath,
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
                    bundle={bundlePath}
                />));
            };
            this.auth(req.session, next);
        });
        this._createRSFiles((err) => {
            if (err) {
                console.error(err);
                return;
            }
            this._start(cb);
        });
    }

    _createRSFiles(cb) {
        const { appDir } = this._config;
        const create = () => {
            async.each(['_createEntryFile', '_setRoutes', '_createSocketMap', '_createPostCSSConfig'], (f, callback) => {
                this[f].call(this, callback);
            }, cb);
        };
        fs.exists(`${appDir}/${RS_DIR}`, (exists) => {
            if (exists) {
                create();
                return;
            }
            fs.mkdir(`${appDir}/${RS_DIR}`, (err) => {
                if (err) {
                    cb(err);
                    return;
                }
                create();
            });
        });
    }

    _setRoutes(cb) {
        this._log('Setting routes');
        const { dev, appDir } = this._config;
        const componentsMap = {};
        this._routes.forEach((route) => {
            this._app[route.method](route.spec, (req, res, next) => {
                // TODO auth
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
            this._createRoutingFile(componentsMap, cb);
        });
    }

    _createEntryFile(cb) {
        this._log('Creating entry file');
        const { appDir } = this._config;
        // TODO path to module
        const pathToTheModule = args.moduleDev
            ? path.relative(path.resolve(`${appDir}/${RS_DIR}/`), path.resolve('./app')).replace(/\\/g, '/')
            : 'reacting-squirrel';
        fs.writeFile(
            `${appDir}/${RS_DIR}/entry.js`,
            `import { Application } from '${pathToTheModule}';
import routingMap from './router.map';
import socketEvents from './socket.map';

Application
            .registerSocketEvents(socketEvents)
            .registerRoutingMap(routingMap)
            .start();
        `, cb,
        );
    }

    _createRoutingFile(map, cb) {
        this._log('Creating routing file');
        const { appDir } = this._config;
        const a = [];
        const b = [];
        Object.keys(map).forEach((key) => {
            const route = map[key];
            const p = path.relative(path.resolve(`${appDir}/${RS_DIR}`), route.path).replace(/\\/g, '/');
            a.push(`import ${key} from '${p}';`);
            b.push(`{spec: '${route.spec}', component: ${key}, title: '${route.title}'}`);
        });
        const s = `${a.join('\n')}${'\n'}export default [${b.join(',')}];`;
        fs.writeFile(`${appDir}/${RS_DIR}/router.map.js`, s, cb);
    }

    _createSocketMap(cb) {
        this._log('Creating socket map');
        const { appDir } = this._config;
        fs.writeFile(`${appDir}/${RS_DIR}/socket.map.js`, `export default [${this._socketEvents.map(e => `'${e.event}'`).join(',')}];`, cb);
    }

    _createPostCSSConfig(cb) {
        this._log('Creating postcss config');
        const { appDir } = this._config;
        fs.writeFile(`${appDir}/${RS_DIR}/postcss.config.js`, 'module.exports={plugins:{autoprefixer: {}}};', cb);
    }

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

    _setApp() {
        this._app = express();
        this._app.use(express.static(this._config.static));
        this._server = http.createServer(this._app);
        this._setWebpack();
        socket(this);
    }

    _setWebpack() {
        const { dev, filename, appDir } = this._config;
        const postCSSLoader = {
            loader: 'postcss-loader',
            options: {
                config: {
                    path: `${appDir}/${RS_DIR}/postcss.config.js`,
                },
            },
        };
        this._webpack = webpack({
            mode: dev ? 'development' : 'production',
            entry: `${appDir}/${RS_DIR}/entry.js`,
            output: {
                path: this._config.path,
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

    _log(message) {
        const { dev } = this._config;
        if (!dev) {
            return;
        }
        console.log(new Date(), message);
    }
}

export {
    Server as default,
    Session,
    Layout,
    SocketClass,
};
