'use strict';

var _server = require('../../../server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _server2.default({
    appDir: './__tests__/app',
    staticDir: './__tests__/public',
    moduleDev: true,
    dev: true
});

app.get('/', 'home', 'Home');

app.start();