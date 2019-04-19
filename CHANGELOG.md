# CHANGELOG

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