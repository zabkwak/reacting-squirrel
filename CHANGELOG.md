# CHANGELOG
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