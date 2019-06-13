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

app.get('/', 'home', 'Home');

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

app.get('/', 'home', 'Home');

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

## Core functions
### Routes register
The routes are registered on the server-side. The module is using express based routes registering.
```javascript
import Server from 'reacting-squirrel/server';

const app = new Server();

// On the route '/' will be rendered the content copmponent located in {config.appDir}/home with Home title.
app.get('/', 'home', 'Home');

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

    load(socket, data, next) {
        // sends the authorized user data after the 'user.load' socket request
        next(null, this.getUser());
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

```json
// rsconfig.json
{
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
    "socketClassDir": "./dist/network/socket"
}
```

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

## Docs
Checkout the documentation [here](https://zabkwak.github.io/reacting-squirrel/).

## TODO
[https://trello.com/b/FepP7DPC/reacting-squirrel](https://trello.com/b/FepP7DPC/reacting-squirrel)

