# CHANGELOG

## 0.14.14
### Updates
- Changed default lang of the server html.
### Fixes
- Modules styles compilation in production mode.

## 0.14.13
### Features
- Option to add modules to babel-loader.
### Updates
- Styles are compiled before webpack start.
- Route info in error logging.

## 0.14.12
### Features
- Webpack nonce for CSP.
- Accessing to texts in res directory. EXPERIMENTAL
### Updates
- RegExp for including debug module in babel-loader.

## 0.14.11
### Features
- `Server.registerBeforeExecution` method for registering callbacks before the route execution.

## 0.14.10
### Updates
- Undefined are not sent from the client.
- Removed socket.io cookie by default.

## 0.14.9
### Features
- Custom error page.
- Cookies config.
### Fixes
- Callback error in `Server.get` method.

## 0.14.8
### Features
- Url passed to the layout
### Updates
- Updated types

## 0.14.7
### Fixes
- Wrong removing listeners in the callback-emitter.

## 0.14.6
### Updates
- RegExp for including debug module in babel-loader.

## 0.14.5
### Features
- Server.registerRouteCallback method.
- Page.setTitle method.
- SocketClass.notSocketMethod decorator.
- Client side Utils.
- Autoprefixer config as server option.
### Updates
- Babel polyfill loaded with webpack.
- Including debug module in babel-loader for properly working in IE11.

## 0.14.4
### Updates
- Updated dependencies.

## 0.14.3
### Features
- SocketClass.broadcast decorator.
### Updates
- Updated dependencies.
### Fixes
- Socket request timeout after the clear process in the SocketRequest.

## 0.14.2
### Updates
- Updated styles processor.

## 0.14.1
### Updates
- Merging styles are compiled before styles in `cssDir`.

## 0.14.0
### Updates
- Updated major webpack loaders dependencies.
- SocketRequest.castResponse decorator for converting socket response with runtime-type module. EXPERIMENTAL
### Breaking changes
- Minimal nodejs version is 8.9.0.

## 0.13.14
### Features
- SocketRequest class.
### Updates
- Removed some cycled dependencies.

## 0.13.13
### Updates
- Updated type definition.

## 0.13.12
### Updates
- Using legacy decorators for typescript support.

## 0.13.11
### Updates
- App version in the initial data.
- SocketClass.requireAuth decorator. EXPERIMENTAL

## 0.13.10
### Fixes
- React error with non-existing DOM target in production mode.

## 0.13.9
### Updates
- Updated render methods in the base layout for possibility to override almost entire html.

## 0.13.8
### Updates
- Updated dependencies.
- Suppression of the error if dom for component is not in the layout in production mode.
### Fixes
- Custom layout for route requiring as module.

## 0.13.7
### Features
- Custom layout for route.

## 0.13.6
### Features
- Layout has renderMeta method for rendering meta data in html head.

## 0.13.5
### Updates
- Updated docs.
- Registering socket class dir ignores maps and type definitions.

## 0.13.4
### Updates
- Updated dependencies.

## 0.13.3
### Updates
- Updated test command
- Added resolveJSONModule to app tsconfig.

## 0.13.2
### Features
- HTML tags in texts can be renedered as JSX.
### Updates
- Updated docs

## 0.13.1
### Updates
- Cleaned dependencies
- Updated docs

## 0.13.0
### Features
- Loading of rsconfig.json for specify routes, components and directory with socket classes.
### Updates
- HTML docs

## 0.12.0
### Updates
- Custom webpack loader for merging styles in the bundling process.

## 0.11.1
### Features
- Option to register styles in node_modules (or anywhere) to the styles processor.
### Updates
- Styles compiler as external module.

## 0.11.0
### Features
- Compilation of styles.

## 0.10.2
### Updates
- Updated type definition

## 0.10.1
### Fixes
- Error if the socket data value is null or undefined.

## 0.10.0
### Features
- Utils module for simplify routes, socket-classes and components registration.
### Updates
- Socket data are converted to messagepack and chunked while sending from the client.

## 0.9.10
### Updates
- removed tmp dir from repository

## 0.9.9
### Updates
- @types/socket.io dependency

## 0.9.8
### Features
- socket server options

## 0.9.7
### Fixes
- undefined statusCode of the http error

## 0.9.6
### Updates
- parsing errors for SmartError payload

## 0.9.5
### Updates
- ts for web app is targeted to es5

## 0.9.4
### Updates
- removed package-lock.json (again)

## 0.9.3
### Features
- possibility to register component's ref to the application context

## 0.9.2
### Features
- allowed void Promises in the socket listeners
- added option to handle with webpack progress
### Fixes
- version of the app in the scripts or styles paths with query string included

## 0.9.1
### Features
- `on` method in the `Socket` class for handling base socket events

## 0.9.0
### Features
- Passing `Socket` instance to socket listeners instead of `Session`.

## 0.8.3
### Features
- catching errors in socket events

## 0.8.2
### Updates
- updated server type definition

## 0.8.1
### Features
- Importing @babel/polyfill in the entry script

## 0.8.0
### Features
- Saving & loading states of the components
- Deprecating button component
- Minor refactoring
### Fixes
- Fixed missing sessions in the socket classes

## 0.7.2
### Updates
- updated server type definition

## 0.7.1
### Updates
- server type definition in the server directory

## 0.7.0
### Features
- babel-loader update to latest
- `Page.onPageRender` method
- changelog
### Fixes
- fixed callback handling in multiple request in SocketComponent