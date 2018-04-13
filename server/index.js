'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _layout = require('./layout');

var _layout2 = _interopRequireDefault(_layout);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
    function Server(config) {
        _classCallCheck(this, Server);

        this._app = null;
        this._server = null;
        this._webpack = null;
        this._config = {
            port: 8080,
            static: './public',
            dev: false,
            path: null,
            filename: 'bundle.js',
            entry: './app/index.js',
            layoutComponent: _layout2.default,
            scripts: [],
            styles: [],
            webpack: {}
        };

        this._config = _extends({}, this._config, config);
        if (!this._config.path) {
            throw new Error('Path field in config is required.');
        }
        this._setApp();
    }

    _createClass(Server, [{
        key: 'get',
        value: function get(route, contentComponent, title) {}
    }, {
        key: 'start',
        value: function start() {
            var _this = this;

            var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
            var _config = this._config,
                port = _config.port,
                dev = _config.dev,
                layoutComponent = _config.layoutComponent;

            var Layout = layoutComponent;
            this._app.use(function (req, res, next) {
                res.render = function (_ref) {
                    var scripts = _ref.scripts,
                        styles = _ref.styles,
                        data = _ref.data,
                        title = _ref.title;

                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.end(_server2.default.renderToString(_react2.default.createElement(Layout, {
                        scripts: _this._config.scripts.concat(scripts || []),
                        styles: _this._config.styles.concat(styles || []),
                        initialData: data || {},
                        title: title,
                        user: req.user
                    })));
                };
                next();
            });
            this._app.get('/', function (req, res, next) {
                res.render({ title: 'TEST' });
            });
            if (dev) {
                this._webpack.watch({ aggregateTimeout: 300 }, function (err, stats) {
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
            this._webpack.run(function (err, stats) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(stats.toJson('minimal'));
                _this._app.listen(port, cb);
            });
        }
    }, {
        key: '_setApp',
        value: function _setApp() {
            var _config2 = this._config,
                dev = _config2.dev,
                filename = _config2.filename,
                entry = _config2.entry;

            this._app = (0, _express2.default)();
            this._app.use(_express2.default.static(this._config.static));
            this._server = _http2.default.createServer(this._app);
            this._webpack = (0, _webpack2.default)(_extends({
                mode: dev ? 'development' : 'production',
                entry: entry,
                output: {
                    path: this._config.path,
                    filename: filename
                },
                module: {
                    rules: [{
                        test: /\.js?$/,
                        /*include: [
                            path.resolve(__dirname, 'app')
                        ],*/
                        loader: 'babel-loader',
                        options: {
                            presets: ['stage-2', 'react']
                        }
                    }]
                },
                target: 'web',
                devtool: 'source-map'
            }, this._config.webpack));
        }
    }]);

    return Server;
}();

exports.default = Server;