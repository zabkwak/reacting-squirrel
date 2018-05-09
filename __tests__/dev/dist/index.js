'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('../../../server');

var _server2 = _interopRequireDefault(_server);

var _user = require('./user.socket');

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomLayout = function (_Layout) {
    _inherits(CustomLayout, _Layout);

    function CustomLayout() {
        _classCallCheck(this, CustomLayout);

        return _possibleConstructorReturn(this, (CustomLayout.__proto__ || Object.getPrototypeOf(CustomLayout)).apply(this, arguments));
    }

    _createClass(CustomLayout, [{
        key: 'renderContainer',
        value: function renderContainer() {
            return _react2.default.createElement(
                'div',
                { id: 'container' },
                _react2.default.createElement('div', { id: 'test' }),
                _react2.default.createElement('div', { id: 'content' })
            );
        }
    }]);

    return CustomLayout;
}(_server.Layout);

var app = new _server2.default({
    appDir: './__tests__/app',
    staticDir: './__tests__/public',
    moduleDev: true,
    dev: true,
    layoutComponent: CustomLayout
});

app.get('/', 'home', 'Home');

app.registerSocketClass(_user2.default);

app.registerComponent('test', 'test');

app.start();