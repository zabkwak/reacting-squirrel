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

import Layout from './layout';
import Session from './session';
import Route from './route';
import socket from './socket';
import SocketClass from './socket-class';

class Server {

    /**
     * @callback AuthCallback
     */
    /**
     * @typedef AppConfig
     * @property {number} port
     * @property {string} static
     * @property {boolean} dev
     * @property {string} path
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
        path: './public/js',
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
        this._config = {
            ...this._config,
            ...config,
        };
        if (!this._config.path) {
            throw new Error('Path field in config is required.');
        }
        if (!(new this._config.session() instanceof Session)) {
            throw new Error('Cannot create instance of Session.');
        }
        if (!(new this._config.layoutComponent() instanceof Layout)) {
            throw new Error('Cannot create instance of Layout');
        }
        this._config.path = !path.isAbsolute(this._config.path) ? path.resolve(this._config.path) : this._config.path;
        const pkg = require(path.resolve('./package.json'));
        this._version = pkg.version;
        this._setApp();
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
                />));
            };
            this._config.auth(req.session, next);
        });
        this._createEntryFile((err) => {
            if (err) {
                console.error(err);
                return;
            }
            this._setRoutes((err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                this._createSocketMap((err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    this._start(cb);
                });
            });
        });
    }

    _setRoutes(cb) {
        this._log('Setting routes');
        const { dev } = this._config;
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
                const modulePath = `./${route.contentComponent}`;
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
        fs.writeFile(
            `${appDir}/rs.entry.js`,
            `import { Application } from '../app';
import routingMap from './rs.router.map.js';
import socketEvents from './rs.socket.map.js';

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
            a.push(`import ${key} from '${route.path}';`);
            b.push(`{spec: '${route.spec}', component: ${key}, title: '${route.title}'}`);
        });
        const s = `${a.join('\n')}${'\n'}export default [${b.join(',')}];`;
        fs.writeFile(`${appDir}/rs.router.map.js`, s, cb);
    }

    _createSocketMap(cb) {
        this._log('Creating socket map');
        const { appDir } = this._config;
        fs.writeFile(`${appDir}/rs.socket.map.js`, `export default [${this._socketEvents.map(e => `'${e.event}'`).join(',')}];`, cb);
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
        const { dev, filename, appDir } = this._config;
        this._app = express();
        this._app.use(express.static(this._config.static));
        this._server = http.createServer(this._app);
        this._webpack = webpack({
            mode: dev ? 'development' : 'production',
            entry: `${appDir}/rs.entry.js`,
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
                ],
            },
            target: 'web',
            devtool: dev ? 'source-map' : undefined,
            ...this._config.webpack,
        });
        socket(this);
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
