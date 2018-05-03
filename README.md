# Reacting Squirrel

## TODO
- frontend tests
- render custom components in the layout
- auth required routes
- debug modes

## Classes

<dl>
<dt><a href="#Server">Server</a></dt>
<dd><p>Server part of the application.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AuthCallback">AuthCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#SocketEvent">SocketEvent</a></dt>
<dd></dd>
<dt><a href="#AppConfig">AppConfig</a></dt>
<dd></dd>
<dt><a href="#RouteMappings">RouteMappings</a></dt>
<dd></dd>
</dl>

<a name="Server"></a>

## Server
Server part of the application.

**Kind**: global class  

* [Server](#Server)
    * [new Server(config)](#new_Server_new)
    * [._app](#Server+_app) : <code>any</code>
    * [._routes](#Server+_routes) : <code>Array.&lt;Route&gt;</code>
    * [._config](#Server+_config) : [<code>AppConfig</code>](#AppConfig)
    * [._path](#Server+_path) : <code>string</code>
    * [._bundlePath](#Server+_bundlePath) : <code>string</code>
    * [.port](#Server+port) : <code>number</code>
    * [.staticDir](#Server+staticDir) : <code>string</code>
    * [.staticDirAbsolute](#Server+staticDirAbsolute) : <code>string</code>
    * [.dev](#Server+dev) : <code>boolean</code>
    * [.path](#Server+path) : <code>string</code>
    * [.bundlePath](#Server+bundlePath) : <code>string</code>
    * [.bundlePathAbsolute](#Server+bundlePathAbsolute) : <code>string</code>
    * [.appDir](#Server+appDir) : <code>string</code>
    * [.appDirAbsolute](#Server+appDirAbsolute) : <code>string</code>
    * [.Layout](#Server+Layout) : <code>JSX.Element</code>
    * [.Session](#Server+Session) : <code>function</code>
    * [.getServer()](#Server+getServer) ⇒ <code>http.Server</code>
    * [.getSocketEvents()](#Server+getSocketEvents) ⇒ [<code>Array.&lt;SocketEvent&gt;</code>](#SocketEvent)
    * [.getSocketClasses()](#Server+getSocketClasses) ⇒ <code>Array.&lt;SocketClass&gt;</code>
    * [.auth(session, next)](#Server+auth)
    * [.get(route, contentComponent, title, [callback])](#Server+get)
    * [.registerRoute(method, route, contentComponent, title, [callback])](#Server+registerRoute)
    * [.registerSocketClass(Cls)](#Server+registerSocketClass)
    * [.registerSocketEvent(event, listener)](#Server+registerSocketEvent)
    * [.start([cb])](#Server+start)
    * [._createRSFiles(cb)](#Server+_createRSFiles)
    * [._setRoutes(cb)](#Server+_setRoutes)
    * [._createEntryFile(cb)](#Server+_createEntryFile)
    * [._createRoutingFile(map, cb)](#Server+_createRoutingFile)
    * [._createSocketMap(cb)](#Server+_createSocketMap)
    * [._createPostCSSConfig(cb)](#Server+_createPostCSSConfig)
    * [._validateAppDir(cb)](#Server+_validateAppDir)
    * [._validateRSDir(cb)](#Server+_validateRSDir)
    * [._start(cb)](#Server+_start)
    * [._setApp()](#Server+_setApp)
    * [._setWebpack()](#Server+_setWebpack)
    * [._getRSDirPath()](#Server+_getRSDirPath) ⇒ <code>string</code>
    * [._getRSDirPathAbsolute()](#Server+_getRSDirPathAbsolute) ⇒ <code>string</code>
    * [._log(message)](#Server+_log)
    * [._warn(message)](#Server+_warn)

<a name="new_Server_new"></a>

### new Server(config)
Creates the instance of the server and prepares express app with socket.io.


| Param | Type |
| --- | --- |
| config | [<code>AppConfig</code>](#AppConfig) | 

<a name="Server+_app"></a>

### server._app : <code>any</code>
Express app instance.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+_routes"></a>

### server._routes : <code>Array.&lt;Route&gt;</code>
**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+_config"></a>

### server._config : [<code>AppConfig</code>](#AppConfig)
**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+_path"></a>

### server._path : <code>string</code>
Absolute path to the javascript directory for the webpack config.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+_bundlePath"></a>

### server._bundlePath : <code>string</code>
Bundle path in the website structure.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+port"></a>

### server.port : <code>number</code>
Port on which the server listens.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+staticDir"></a>

### server.staticDir : <code>string</code>
Relative path to the static directory for the express app.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+staticDirAbsolute"></a>

### server.staticDirAbsolute : <code>string</code>
Absolute path to the static directory for the express app.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+dev"></a>

### server.dev : <code>boolean</code>
Flag of the dev status of the app.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+path"></a>

### server.path : <code>string</code>
Absolute path to the javascript directory for the webpack config.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+bundlePath"></a>

### server.bundlePath : <code>string</code>
Bundle path in the website structure.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+bundlePathAbsolute"></a>

### server.bundlePathAbsolute : <code>string</code>
Absolute path to the bundle file in the application structure.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+appDir"></a>

### server.appDir : <code>string</code>
Relative path to the application directory.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+appDirAbsolute"></a>

### server.appDirAbsolute : <code>string</code>
Absolute path to the application directory.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+Layout"></a>

### server.Layout : <code>JSX.Element</code>
JSX element for the layout component

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+Session"></a>

### server.Session : <code>function</code>
Object of the session.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+getServer"></a>

### server.getServer() ⇒ <code>http.Server</code>
Gets the http server.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+getSocketEvents"></a>

### server.getSocketEvents() ⇒ [<code>Array.&lt;SocketEvent&gt;</code>](#SocketEvent)
Gets the list of registered socket events.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+getSocketClasses"></a>

### server.getSocketClasses() ⇒ <code>Array.&lt;SocketClass&gt;</code>
Gets the list of registered socket classes.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+auth"></a>

### server.auth(session, next)
Calls the auth function from the config.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type |
| --- | --- |
| session | <code>Session</code> | 
| next | <code>function</code> | 

<a name="Server+get"></a>

### server.get(route, contentComponent, title, [callback])
Registers the GET route.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | Route spec. |
| contentComponent | <code>string</code> | Relative path from the {config.appDir} to the component. |
| title | <code>string</code> | Title of the page. |
| [callback] | <code>function</code> | Callback to call when the route is called. |

<a name="Server+registerRoute"></a>

### server.registerRoute(method, route, contentComponent, title, [callback])
Registers the route.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | HTTP method of the route. |
| route | <code>string</code> | Route spec. |
| contentComponent | <code>string</code> | Relative path from the {config.appDir} to the component. |
| title | <code>string</code> | Title of the page. |
| [callback] | <code>function</code> | Callback to call when the route is called. |

<a name="Server+registerSocketClass"></a>

### server.registerSocketClass(Cls)
Registers the socket class to handle socket events.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| Cls | <code>function</code> | Class inherited from SocketClass. |

<a name="Server+registerSocketEvent"></a>

### server.registerSocketEvent(event, listener)
Registers the socket event.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Name of the event. |
| listener | <code>function</code> | Listener to call after the socket request. |

<a name="Server+start"></a>

### server.start([cb])
Starts the express server. In that process it creates all necessary files.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| [cb] | <code>function</code> | Callback to call after the server start. |

<a name="Server+_createRSFiles"></a>

### server._createRSFiles(cb)
Creates the resting-squirrel files.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_setRoutes"></a>

### server._setRoutes(cb)
Registers the routes to the express app and creates the routing map for the front-end.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback called after the registration of the routes and creation of the routing map. |

<a name="Server+_createEntryFile"></a>

### server._createEntryFile(cb)
Creates the entry file required for the webpack.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_createRoutingFile"></a>

### server._createRoutingFile(map, cb)
Creates the routing file for the front-end application.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| map | <code>Object.&lt;string, RouteMappings&gt;</code> | Map of the routes. |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_createSocketMap"></a>

### server._createSocketMap(cb)
Creates the socket map for the front-end application.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_createPostCSSConfig"></a>

### server._createPostCSSConfig(cb)
Creates the postcss config for the front-end application.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_validateAppDir"></a>

### server._validateAppDir(cb)
Checks if the {config.appDir} exists. If not the directory is created.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_validateRSDir"></a>

### server._validateRSDir(cb)
Checks if the RS directory exists. If not the directory is created.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the creation process. |

<a name="Server+_start"></a>

### server._start(cb)
Starts the webpack and the express server. If the app is in dev mode the webpack watcher is started.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| cb | <code>function</code> | Callback to call after the server start. |

<a name="Server+_setApp"></a>

### server._setApp()
Sets the express app, webpack and registers socket server.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+_setWebpack"></a>

### server._setWebpack()
Creates the webpack instance.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+_getRSDirPath"></a>

### server._getRSDirPath() ⇒ <code>string</code>
Gets the relative path to the RS directory.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+_getRSDirPathAbsolute"></a>

### server._getRSDirPathAbsolute() ⇒ <code>string</code>
Gets the absolute path to the RS directory.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+_log"></a>

### server._log(message)
Logs the message to the console if the app is in the dev mode.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to log. |

<a name="Server+_warn"></a>

### server._warn(message)
Logs the warning message to the console.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | Message to log. |

<a name="AuthCallback"></a>

## AuthCallback : <code>function</code>
**Kind**: global typedef  
<a name="SocketEvent"></a>

## SocketEvent
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| event | <code>string</code> | 
| listener | <code>function</code> | 

<a name="AppConfig"></a>

## AppConfig
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| port | <code>number</code> | Port on which the app listens. |
| staticDir | <code>string</code> | Relative path to the static directory for the express app. |
| dev | <code>boolean</code> |  |
| jsDir | <code>string</code> |  |
| filename | <code>string</code> |  |
| appDir | <code>string</code> |  |
| layoutComponent | <code>JSX.Element</code> |  |
| cookieSecret | <code>string</code> |  |
| scripts | <code>Array.&lt;string&gt;</code> |  |
| styles | <code>Array.&lt;string&gt;</code> |  |
| session | <code>function</code> |  |
| auth | <code>function</code> |  |
| webpack | <code>any</code> |  |

<a name="RouteMappings"></a>

## RouteMappings
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | Title of the page. |
| spec | <code>string</code> | Route spec of the page. |
| path | <code>string</code> | Absolute path to the component. |

## Modules

<dl>
<dt><a href="#module_Router">Router</a></dt>
<dd></dd>
<dt><a href="#module_Socket">Socket</a></dt>
<dd></dd>
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
        * [.getRoute()](#module_Router..Router+getRoute)
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
    * [.getRoute()](#module_Router..Router+getRoute)

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

#### router.getRoute()
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
        * [.connect()](#module_Socket..Socket+connect)
        * [.emit(event, data)](#module_Socket..Socket+emit)
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
    * [.connect()](#module_Socket..Socket+connect)
    * [.emit(event, data)](#module_Socket..Socket+emit)
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

#### socket.connect()
Connects the socket to the server. This method can be called only once. If the server disconnects the socket the socket is automatically reconnected when it's posiible.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  
<a name="module_Socket..Socket+emit"></a>

#### socket.emit(event, data)
Emits the data.

**Kind**: instance method of [<code>Socket</code>](#module_Socket..Socket)  

| Param | Type |
| --- | --- |
| event | <code>string</code> | 
| data | <code>any</code> | 

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

