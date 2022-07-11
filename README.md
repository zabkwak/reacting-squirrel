# Reacting Squirrel
Framework for creation of the [React](https://reactjs.org/) apps using [Express](https://expressjs.com/) and [Socket.io](https://socket.io/). 
Sample app can be cloned from [GitHub](https://github.com/zabkwak/reacting-squirrel-sample).

## Requirements
- The module needs to be able to write in the app directory (config.appDir). It creates the directory where are stored the frontend maps.
- The module needs to be able to write in the css directory (config.cssDir). It creates one app style.
- The frontend needs the possibility to work with websockets (connection upgrade in nginx).

## Installation
```bash
npm install reacting-squirrel --save
```

## Usage
### Simple app
```javascript
// ./index.js
import Server from 'reacting-squirrel/server';

const app = new Server();

app.registerRoute('get', '/', 'home', 'Home');

app.start();

// ./app/home.js
import React from 'react';
import { Page } from 'reacting-squirrel';

export default class HomePage extends Page {
    
    render() {
        return (
            <div>
                <h1>Home</h1>
            </div>
        );
    }
}
```
This code will start simple app on the default port with one page which will be the home page.

### App using websockets for load the user
```javascript
// ./index.js
import Server from 'reacting-squirrel/server';

import UserSocket from './socket.user';

import UserStore from './user-store';

const app = new Server({
    auth: (session, next) => {
        UserStore.load(session.id, (err, user) => {
            if (err) {
                next(err);
                return;
            }
            session.setUser(user);
            next();
        });
    }
});

app.registerRoute('get', '/', 'home', 'Home');

app.registerSocketClass(UserSocket);

app.start();

// ./socket.user.js
import { SocketClass } from 'reacting-squirrel/server';

export default class User extends SocketClass {

    load(socket, data, next) {
        next(null, this.getUser());
    }
}

// ./app/home.js
import React from 'react';
import { Page } from 'reacting-squirrel';

export default class HomePage extends Page {

    state = {
        user: null,
    };

    componentDidMount() {
        super.componentDidMount();
        this.request('user.load', (err, user) => {
            if (err) {
                alert(err.message);
                return;
            }
            this.setState({ user });
        });
    }
    
    render() {
        const { user } = this.state;
        return (
            <div>
                <h1>Home</h1>
                <h2>{user ? user.name : 'Loading...'}</h2>
            </div>
        );
    }
}
```
This code will start simple app on the default port. After the page load the `user.load` event is emitted and `UserSocket` class is trying to load the logged user and send it back to the page.

### CLI
The simple server can be started over the CLI using `./node_modules/.bin/rs-start-server` and creating `rsconfig.json` in application root.

### Providers
All components rendered by the application can be wrapped with `Provider` such as `Context.Provider` or `ThemeProvider`. Only thing needed is to register the provider with server method, rsconfig or plugin.

### Typescript
There can be issues with typings in the `app` directory because the IDE can't find `tsconfig.json` in `app/~rs` directory.
Workaround can be simply create the `tsconfig.json` in `app` directory that extends the generated configuration.
```json
{
	"extends": "./~rs/tsconfig.json"
}
```

## Core functions
### Routes register
The routes are registered on the server-side. The module is using express based routes registering.
```javascript
import Server from 'reacting-squirrel/server';

const app = new Server();

// On the route '/' will be rendered the content component located in {config.appDir}/home with 'Home' title.
app.registerRoute('get', '/', 'home', 'Home');

app.start();
```
### Socket events register
The socket events can be directly registered. It should be used for simple socket events which don't need authorization.
```javascript
import Server from 'reacting-squirrel/server';

const app = new Server();

// Frontend app can emit 'test' with some data. The event's listener emits the data back.
app.registerSocketEvent('test', (socket, data, next) => next(null, data));

app.start();
```
### Socket classes register
The socket classes can handle multiple socket events prefixed by the class name. After the registration of the socket class socket events are automatically registered to the server app.
```javascript
// ./socket.user.js
import { SocketClass } from 'reacting-squirrel/server';

export default class User extends SocketClass {

	// This method can be called from the client as 'user.load'
	// The approach with 'next' callback is not recommended.
    load(socket, data, next) {
        // sends the authorized user data after the 'user.load' socket request
        next(null, socket.getSession().getUser());
    }

	// This method can be called from the client as 'user.updateUser'
	async updateUser(socket, data) {
		await doSomeAsyncOperation();
		return socket.getSession().getUser().getUser();
	}
}

// ./index.js
import Server from 'reacting-squirrel/server';

import UserSocket from './socket.user';

import UserStore from './user-store';

const app = new Server({
    auth: (session, next) => {
        UserStore.load(session.id, (err, user) => {
            if (err) {
                next(err);
                return;
            }
            session.setUser(user);
            next();
        });
    }
});

// Registeres the socket class
app.registerSocketClass(UserSocket);

app.start();
```
### Components register
The module can register custom components which are rendered in custom DOM element in the layout. 
```javascript
import Server from 'reacting-squirrel/server';

const app = new Server();

// Frontend app tries to render component located at {config.appDir}/test to the DOM element with id 'test'
app.registerComponent('test', 'test');

app.start();
```
### RSConfig
RSConfig file can contain list of routes, list of components and the directory with the socket classes. By default the file `rsconfig.json` is searched in the `process.cwd()` directory. If the file doesn't exist nothing happens. The path to the file can by changed with config.rsConfig option.  

The schema for the file is located in `[pathToModule]/schemas/rsconfig.schema.json`.

```json
// rsconfig.json
{
	"$schema": "./node_modules/reacting-squirrel/schemas/rsconfig.schema.json",
    "routes": [
        {
            "route": "/",
            "component": "home",
            "title": "Home",
            "requiredAuth": false,
            "method": "GET"
        }
    ],
    "components": [
        {
            "id": "test",
            "component": "test"
        }
    ],
	"socketClassDir": "./dist/network/socket",
	"errorPage": "error-page"
}
```
Additional app config can be also be defined in the rsconfig.

#### ENV vars
Values in rsconfig that have `$env:[value]|[defaultValue]` prefix are replaced with `process.env[value]` in the server start.  
If the env var is not in the process the default value is used (if specified).

### Texts
In the startup process, the `res` directory is created in `app` directory. In that directory is created default text file `text.json`. The content of the text file is used as default dictionary using [texting-squirrel](https://www.npmjs.com/package/texting-squirrel) module.
#### Accessing text from the component
All components have `getText` method to access the text from the dictionary.
```javascript
import { Component } from 'reacting-squirrel';

export default class CustomComponent extends Component {

    render() {
        return <h1>{this.getText('title')}</h1>;
    }
}

```
#### Using Text component
The module contains a text component to handle dictionary directly from the JSX code.

```javascript
import { Component, Text } from 'reacting-squirrel';

export default class CustomComponent extends Component {

    render() {
        return <Text dictionaryKey="title" tag="h1" />
    }
}

```
#### Using texts on the server side (experimental)
The instance of the server has a property `Text` which is just `texting-squirrel` module with registered directories.  
Server option `locale` defines supported locales and dictionary text files are created (if not exist) and registered in the server startup.

##### Page titles
If the page title starts with the `:` the key (without the first character) is searched in the locale dictionary.

#### Translations
The dictionaries can be registered for different languages. The accepted languages should be set with the `locale.accepted` option on the server and dictionaries will be created in the `res` directory. The default language is taken from the browser (the dictionary must exist). 
##### Changing the locale
The locale can be changed on the client side using `Application.setLocale` method and it's handled on the server side (still experimental) with cookie `rs~locale`.  
<b>NOTE:</b> In case of setting locale to the default dictionary it has to be the `default` keyword instead of the value.

## Socket communication
The module is using socket.io as a default communication protocol. The payload is chunked (default 10kB per chunk) and sent to the server. 
### Uploading files (experimental)
File upload can be diffucult over websocket. Without chunks big files disconnects the socket because of the `pingTimeout`. The file is sent to the server in chunks and converted to buffer on the server side.
```javascript
const file = 'get somehow a File instance';
Socket.emit('file.upload', undefined, { file }, (progress) => console.log(progress));
```
#### Limitations
The server limits the message size. If the size is bigger than allowed limit, the socket is disconnected. The module has 100MB cap for the message size.

## Decorators
### SocketClass
Decorators are designed for the the `SocketClass` methods.
#### broadcast
Data returned in the method are broadcasted to the client side.
#### requireAuth
Before the method execution is checked the logged user in the session. If it's not the error is thrown.
#### notSocketMethod
The method is not registered as socket method and cannot be called from the client side.
### SocketRequest
#### castResponse
The response is casted to defined types using [runtime-type](https://www.npmjs.com/package/runtime-type) module.

## Plugins
The plugins can be registered with `Server.registerPlugin` method. The plugin should extent `Plugin` class in the module.
Plugin can:
- Inject script to the entry file.
- Add socket events.
- Add socket classes.
- Register route callbacks.
- Register before execution functions.
- Register scripts.
- Register styles.
- Register styles to merge.
- Add middleware.
- Register pages.
- Register components.
### Pages
The pages can be register using `getPages` method. The path to the component can be absolute so it must not be in the `app` directory. 
### Components
The components can be register using `getComponents` method. The path to the component can be also absolute. 

## Docs
Checkout the documentation [here](https://zabkwak.github.io/reacting-squirrel/).

### Deprecated
[https://trello.com/b/FepP7DPC/reacting-squirrel](https://trello.com/b/FepP7DPC/reacting-squirrel)

