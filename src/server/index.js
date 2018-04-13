import express from 'express';
import http from 'http';
import webpack from 'webpack';
import path from 'path';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Layout from './layout';

export default class Server {

    _app = null;
    _server = null;
    _webpack = null;
    _config = {
        port: 8080,
        static: './public',
        dev: false,
        path: null,
        filename: 'bundle.js',
        entry: './app/index.js',
        layoutComponent: Layout,
        scripts: [],
        styles: [],
        webpack: {},
    };

    constructor(config) {
        this._config = {
            ...this._config,
            ...config,
        };
        if (!this._config.path) {
            throw new Error('Path field in config is required.');
        }
        this._setApp();
    }

    get(route, contentComponent, title) {

    }

    start(cb = () => { }) {
        const { port, dev, layoutComponent } = this._config;
        const Layout = layoutComponent;
        this._app.use((req, res, next) => {
            res.render = ({ scripts, styles, data, title }) => {
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.end(ReactDOMServer.renderToString(<Layout
                    scripts={this._config.scripts.concat(scripts || [])}
                    styles={this._config.styles.concat(styles || [])}
                    initialData={data || {}}
                    title={title}
                    user={req.user}
                />));
            };
            next();
        });
        this._app.get('/', (req, res, next) => {
            res.render({ title: 'TEST' });
        });
        if (dev) {
            this._webpack.watch({ aggregateTimeout: 300 }, (err, stats) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(stats.toJson('minimal'));
            });
            this._app.listen(port, cb);
            return;
        }
        // this._app.listen(port, cb);
        this._webpack.run((err, stats) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(stats.toJson('minimal'));
            this._app.listen(port, cb);
        });
    }

    _setApp() {
        const { dev, filename, entry } = this._config;
        this._app = express();
        this._app.use(express.static(this._config.static));
        this._server = http.createServer(this._app);
        this._webpack = webpack({
            mode: dev ? 'development' : 'production',
            entry,
            output: {
                path: this._config.path,
                filename,
            },
            module: {
                rules: [
                    {
                        test: /\.js?$/,
                        /*include: [
                            path.resolve(__dirname, 'app')
                        ],*/
                        loader: 'babel-loader',
                        options: {
                            presets: ['stage-2', 'react']
                        }
                    },
                ]
            },
            target: 'web',
            devtool: dev ? 'source-map' : undefined,
            ...this._config.webpack,
        });
    }
}
