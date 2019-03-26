# Reacting Squirrel
Framework for creation of the [React](https://reactjs.org/) apps using [Express](https://expressjs.com/) and [Socket.io](https://socket.io/). 
Sample app can be cloned from [GitHub](https://github.com/zabkwak/reacting-squirrel-sample).

## Requirements
- The module needs to be able to write in the app directory (config.appDir). It creates the directory where are stored the frontend maps.
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

    load(session, data, next) {
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
app.registerSocketEvent('test', (session, data, next) => next(null, data));

app.start();
```
### Socket classes register
The socket classes can handle multiple socket events prefixed by the class name. After the registration of the socket class socket events are automatically registered to the server app.
```javascript
// ./socket.user.js
import { SocketClass } from 'reacting-squirrel/server';

export default class User extends SocketClass {

    load(session, data, next) {
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

## TODO
[https://trello.com/b/FepP7DPC/reacting-squirrel](https://trello.com/b/FepP7DPC/reacting-squirrel)

## Modules

<dl>
<dt><a href="#module_Router">Router</a></dt>
<dd></dd>
<dt><a href="#module_Socket">Socket</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#Application">Application</a></dt>
<dd><p>Base class for client application context.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#addListener">addListener(event, listener)</a></dt>
<dd><p>Adds the listener to the event.</p>
</dd>
<dt><a href="#removeListener">removeListener(event, listener)</a></dt>
<dd><p>Removes the listener from the event.</p>
</dd>
<dt><a href="#_callListener">_callListener(event, args)</a></dt>
<dd><p>Calls all listeners registered on the event.</p>
</dd>
<dt><a href="#_hasEventRegistered">_hasEventRegistered(event)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if the event is registered to the listener.</p>
</dd>
<dt><a href="#getContext">getContext()</a></dt>
<dd><p>Gets the application context.</p>
</dd>
<dt><a href="#onPopState">onPopState(event)</a></dt>
<dd><p>Method called after the window.onpopstate event.</p>
</dd>
<dt><a href="#saveState">saveState(key)</a></dt>
<dd><p>Saves the component state to memory storage.</p>
</dd>
<dt><a href="#loadState">loadState(key)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Loads the saved state and sets it to the component state.</p>
</dd>
<dt><a href="#getStateKey">getStateKey()</a> ⇒ <code>string</code></dt>
<dd><p>Gets the state key for memory storage. If the method returns string the saveState and loadState methods are automatically called in the component lifecycle.</p>
</dd>
<dt><a href="#request">request(event, data, timeout, callback)</a></dt>
<dd><p>Requests the data over the socket. It automatically handles listeners on the Socket class and calls the callback.</p>
</dd>
<dt><a href="#emit">emit(event, [data])</a></dt>
<dd><p>Emits the socket event with data. The event is sent after the socket is connected =&gt; this method can be called before the socket connection.</p>
</dd>
</dl>

<a name="module_Router"></a>

## Router

* [Router](#module_Router)
    * [~Router](#module_Router..Router)
        * [._routes](#module_Router..Router+_routes) : <code>Object.&lt;string, Route&gt;</code>
        * [.addRoute(route)](#module_Router..Router+addRoute)
        * [.getRoute()](#module_Router..Router+getRoute) ⇒ <code>Route</code>
    * [~Route](#module_Router..Route)
        * [new Route(spec, component, title, initialData)](#new_module_Router..Route_new)
        * [.create(route)](#module_Router..Route.create)

<a name="module_Router..Router"></a>

### Router~Router
Class to work with routes.

**Kind**: inner class of [<code>Router</code>](#module_Router)  

* [~Router](#module_Router..Router)
    * [._routes](#module_Router..Router+_routes) : <code>Object.&lt;string, Route&gt;</code>
    * [.addRoute(route)](#module_Router..Router+addRoute)
    * [.getRoute()](#module_Router..Router+getRoute) ⇒ <code>Route</code>

<a name="module_Router..Router+_routes"></a>

#### router._routes : <code>Object.&lt;string, Route&gt;</code>
**Kind**: instance property of [<code>Router</code>](#module_Router..Router)  
<a name="module_Router..Router+addRoute"></a>

#### router.addRoute(route)
**Kind**: instance method of [<code>Router</code>](#module_Router..Router)  

| Param | Type |
| --- | --- |
| route | <code>Route</code> | 

<a name="module_Router..Router+getRoute"></a>

#### router.getRoute() ⇒ <code>Route</code>
Gets the current route.

**Kind**: instance method of [<code>Router</code>](#module_Router..Router)  
<a name="module_Router..Route"></a>

### Router~Route
**Kind**: inner class of [<code>Router</code>](#module_Router)  

* [~Route](#module_Router..Route)
    * [new Route(spec, component, title, initialData)](#new_module_Router..Route_new)
    * [.create(route)](#module_Router..Route.create)

<a name="new_module_Router..Route_new"></a>

#### new Route(spec, component, title, initialData)

| Param | Type |
| --- | --- |
| spec | <code>string</code> | 
| component | <code>JSX.Element</code> | 
| title | <code>string</code> | 
| initialData | <code>Object.&lt;string, any&gt;</code> | 

<a name="module_Router..Route.create"></a>

#### Route.create(route)
**Kind**: static method of [<code>Route</code>](#module_Router..Route)  

| Param | Type |
| --- | --- |
| route | <code>object</code> | 
| route.spec | <code>string</code> | 
| route.component | <code>JSX.Element</code> | 
| route.title | <code>string</code> | 
| route.initialData | <code>Object.&lt;string, any&gt;</code> | 

<a name="module_Socket"></a>

## Socket

* [Socket](#module_Socket)
    * [~Socket](#module_Socket..Socket)
        * [.STATE_NONE](#module_Socket..Socket+STATE_NONE)
        * [.STATE_CONNECTING](#module_Socket..Socket+STATE_CONNECTING)
        * [.STATE_CONNECTED](#module_Socket..Socket+STATE_CONNECTED)
        * [.STATE_DISCONNECTED](#module_Socket..Socket+STATE_DISCONNECTED)
        * [.connect(address)](#module_Socket..Socket+connect)
        * [.emit(event, data)](#module_Socket..Socket+emit)
        * [.disconnect()](#module_Socket..Socket+disconnect)
        * [.getState()](#module_Socket..Socket+getState)
        * [.isConnected()](#module_Socket..Socket+isConnected)
        * [._setState(state)](#module_Socket..Socket+_setState)

<a name="module_Socket..Socket"></a>

### Socket~Socket
Class to handle communication with the server app using websockets.

**Kind**: inner class of [<code>Socket</code>](#module_Socket)  

* [~Socket](#module_Socket..Socket)
    * [.STATE_NONE](#module_Socket..Socket+STATE_NONE)
    * [.STATE_CONNECTING](#module_Socket..Socket+STATE_CONNECTING)
    * [.STATE_CONNECTED](#module_Socket..Socket+STATE_CONNECTED)
    * [.STATE_DISCONNECTED](#module_Socket..Socket+STATE_DISCONNECTED)
    * [.connect(address)](#module_Socket..Socket+connect)
    * [.emit(event, data)](#module_Socket..Socket+emit)
    * [.disconnect()](#module_Socket..Socket+disconnect)
    * [.getState()](#module_Socket..Socket+getState)
    * [.isConnected()](#module_Socket..Socket+isConnected)
    * [._setState(state)](#module_Socket..Socket+_setState)

<a name="module_Socket..Socket+STATE_NONE"></a>

#### socket.STATE_NONE
The socket is not initiated.

**Kind**: instance property of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+STATE_CONNECTING"></a>

#### socket.STATE_CONNECTING
The socket is connecting to the server.

**Kind**: instance property of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+STATE_CONNECTED"></a>

#### socket.STATE_CONNECTED
The socket is connected to the server.

**Kind**: instance property of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+STATE_DISCONNECTED"></a>

#### socket.STATE_DISCONNECTED
The socket is disconnected from the server.

**Kind**: instance property of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+connect"></a>

#### socket.connect(address)
Connects the socket to the server. This method can be called only once. If the server disconnects the socket the socket is automatically reconnected when it's posiible.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  

| Param | Type | Description |
| --- | --- | --- |
| address | <code>string</code> | Address of the socket server. |

<a name="module_Socket..Socket+emit"></a>

#### socket.emit(event, data)
Emits the data.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 
| data | <code>any</code> | 

<a name="module_Socket..Socket+disconnect"></a>

#### socket.disconnect()
Disconnects the socket.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+getState"></a>

#### socket.getState()
Gets the current state of the socket.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+isConnected"></a>

#### socket.isConnected()
Checks if socket is in connected state.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+_setState"></a>

#### socket._setState(state)
Sets the state of the socket and calls 'state' event of CallbackEmitter.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  

| Param | Type |
| --- | --- |
| state | <code>\*</code> | 

<a name="Application"></a>

## Application
Base class for client application context.

**Kind**: global class  

* [Application](#Application)
    * [.DEV](#Application+DEV) ⇒ <code>boolean</code>
    * ~~[.initialData](#Application+initialData) ⇒ <code>any</code>~~
    * [.getInitialData(key)](#Application+getInitialData) ⇒ <code>any</code>
    * [.registerRoutingMap(routingMap)](#Application+registerRoutingMap)
    * [.registerSocketEvents(events)](#Application+registerSocketEvents)
    * [.registerComponents(components)](#Application+registerComponents)
    * [.start(connectSocket)](#Application+start)
    * [.refreshContent()](#Application+refreshContent)
    * [.render(route, refresh)](#Application+render)
    * [.renderComponent(component, target, callback)](#Application+renderComponent)
    * [.redirect(path, q)](#Application+redirect)
    * [.navigate(path, q, refresh)](#Application+navigate)
    * [.pushState(path, q)](#Application+pushState)
    * [.setTitle(title)](#Application+setTitle)

<a name="Application+DEV"></a>

### application.DEV ⇒ <code>boolean</code>
**Kind**: instance property of [<code>Application</code>](#Application)  
<a name="Application+initialData"></a>

### ~~application.initialData ⇒ <code>any</code>~~
***Deprecated***

**Kind**: instance property of [<code>Application</code>](#Application)  
<a name="Application+getInitialData"></a>

### application.getInitialData(key) ⇒ <code>any</code>
Gets the initial data.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type | Default |
| --- | --- | --- |
| key | <code>string</code> | <code>null</code> | 

<a name="Application+registerRoutingMap"></a>

### application.registerRoutingMap(routingMap)
Registers the map of routes to the Router.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| routingMap | <code>\*</code> | 

<a name="Application+registerSocketEvents"></a>

### application.registerSocketEvents(events)
Registeres the socket events to the Socket class.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| events | <code>\*</code> | 

<a name="Application+registerComponents"></a>

### application.registerComponents(components)
Registers custom components to render after the start.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| components | <code>Array.&lt;any&gt;</code> | 

<a name="Application+start"></a>

### application.start(connectSocket)
Starts the application. The application can be started only once.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| connectSocket | <code>boolean</code> | <code>true</code> | If true the socket is automatically connected. |

<a name="Application+refreshContent"></a>

### application.refreshContent()
Refreshes the content. Content DOM is cleared and the current Page is rendered.

**Kind**: instance method of [<code>Application</code>](#Application)  
<a name="Application+render"></a>

### application.render(route, refresh)
Renders the route's page in the content element.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type | Default |
| --- | --- | --- |
| route | <code>Route</code> |  | 
| refresh | <code>boolean</code> | <code>false</code> | 

<a name="Application+renderComponent"></a>

### application.renderComponent(component, target, callback)
Renders React component to the HTML element.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| component | <code>JSX.Element</code> | 
| target | <code>HTMLElement</code> | 
| callback | <code>function</code> | 

<a name="Application+redirect"></a>

### application.redirect(path, q)
Pushes the state to the history and forces to render the content.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| q | <code>Object.&lt;string, string&gt;</code> | 

<a name="Application+navigate"></a>

### application.navigate(path, q, refresh)
Pushes the state to the history and renders the route if it's not the actual route and refresh is false.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type | Default |
| --- | --- | --- |
| path | <code>string</code> |  | 
| q | <code>Object.&lt;string, string&gt;</code> |  | 
| refresh | <code>boolean</code> | <code>false</code> | 

<a name="Application+pushState"></a>

### application.pushState(path, q)
Pushes the state to the history.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| path | <code>string</code> | 
| q | <code>Object.&lt;string, string&gt;</code> | 

<a name="Application+setTitle"></a>

### application.setTitle(title)
Updates the page title in the HTML header.

**Kind**: instance method of [<code>Application</code>](#Application)  

| Param | Type |
| --- | --- |
| title | <code>string</code> | 

<a name="addListener"></a>

## addListener(event, listener)
Adds the listener to the event.

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 
| listener | <code>function</code> | 

<a name="removeListener"></a>

## removeListener(event, listener)
Removes the listener from the event.

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 
| listener | <code>function</code> | 

<a name="_callListener"></a>

## _callListener(event, args)
Calls all listeners registered on the event.

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 
| args | <code>any</code> | 

<a name="_hasEventRegistered"></a>

## _hasEventRegistered(event) ⇒ <code>boolean</code>
Checks if the event is registered to the listener.

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 

<a name="getContext"></a>

## getContext()
Gets the application context.

**Kind**: global function  
<a name="onPopState"></a>

## onPopState(event)
Method called after the window.onpopstate event.

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>\*</code> | 

<a name="saveState"></a>

## saveState(key)
Saves the component state to memory storage.

**Kind**: global function  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="loadState"></a>

## loadState(key) ⇒ <code>Promise.&lt;void&gt;</code>
Loads the saved state and sets it to the component state.

**Kind**: global function  

| Param | Type |
| --- | --- |
| key | <code>string</code> | 

<a name="getStateKey"></a>

## getStateKey() ⇒ <code>string</code>
Gets the state key for memory storage. If the method returns string the saveState and loadState methods are automatically called in the component lifecycle.

**Kind**: global function  
<a name="request"></a>

## request(event, data, timeout, callback)
Requests the data over the socket. It automatically handles listeners on the Socket class and calls the callback.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Name of the event. |
| data | <code>Object.&lt;string, object&gt;</code> \| <code>function</code> | Data to emit or the callback. |
| timeout | <code>number</code> \| <code>function</code> | Timeout in milliseconds or the callback. |
| callback | <code>function</code> | Callback is called after the socket execution. |

<a name="emit"></a>

## emit(event, [data])
Emits the socket event with data. The event is sent after the socket is connected => this method can be called before the socket connection.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Name of the event. |
| [data] | <code>Object.&lt;string, object&gt;</code> | Data to emit. |

