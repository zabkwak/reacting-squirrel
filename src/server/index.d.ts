import * as http from 'http';
import * as net from 'net';
import * as express from 'express';
import { Component } from 'react';
import HttpSmartError from 'http-smart-error';
import { ServerOptions as SocketServerOptions } from 'socket.io';
import { TextType } from 'texting-squirrel';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Express request.
 *
 * @typeparam S Type of the Session
 */
export interface IRequest<S extends Session = Session> extends express.Request {
	session: S;
	locale: string;
	getCookie<T = any>(name: string): T;
}

export interface IRenderLayoutData {
	scripts?: Array<string>;
	styles?: Array<string>;
	data?: any;
	title?: string;
	layout?: typeof Layout;
}

/**
 * Express response.
 */
export interface IResponse extends express.Response {
	renderLayout: (data: IRenderLayoutData) => void;
	setCookie: (name: string, value: any, options?: express.CookieOptions) => void;
}

export type RouteCallback = (req: IRequest, res: IResponse, next: (err?: Error, data?: {
	scripts?: Array<string>;
	styles?: Array<string>;
	data?: any;
	title?: string;
	layout?: typeof Layout;
}) => void) => void;

/**
 * Server configuration.
 */
export interface IAppConfig {
    /** Port on which the app listens. 
     * @default 8080 
     */
	port?: number;
    /** 
     * Relative path to the static directory for the express app. 
     * @default './public'
     */
	staticDir?: string;
    /** 
     * Flag of the dev status of the app. 
     * @default false
     */
	dev?: boolean;
    /** 
     * Name of the directory where the javascript is located in the staticDir.
     * @default 'js'
     */
	jsDir?: string;
    /** 
     * Name of the directory where the css is located in the staticDir.
     * @default 'css'
     */
	cssDir?: string;
    /**
     * Name of the bundle file.
     * @default 'bundle.js'
     */
	filename?: string;
    /**
     * Relative path to the app directory.
     * @default './app'
     */
	appDir?: string;
    /**
     * Relative path to the entry file.
     * @default null
     */
	entryFile?: string;
    /**
     * Custom path to rsconfig.json file.
     * @default null
     */
	rsConfig?: string;
    /**
     * React component width default html code.
     * @default typeof Layout
     */
	layoutComponent?: typeof Layout;
    /**
     * Secret which is used to sign cookies.
     * @default null
	 * @deprecated
     */
	cookieSecret?: string;
	/**
	 * Configuration for cookies.
	 */
	cookies?: {
		/**
		 * Secret which is used to sign cookies.
     	 * @default '[random generated string]'
		 */
		secret?: string;
		/**
		 * Secure flag for the cookies. 
		 * @default null
		 */
		secure?: boolean;
		/**
		 * HttpOnly flag for the cookies.
		 * @deprecated The flag should be always true.
		 * @default null
		 */
		httpOnly?: boolean;
	};
    /**
     * List of scripts loaded in the base html.
     * @default []
     */
	scripts?: Array<string>;
    /**
     * List of styles loaded in the base html.
     * @default []
     */
	styles?: Array<string>;
    /**
     * List of styles to merge to rs-app.css.
     * @default []
     */
	mergeStyles?: Array<string>;
    /**
     * Class of the session.
     * @default typeof Session
     */
	session?: typeof Session;
    /**
     * Maximal size of one socket message.
     * @default 104857600
     */
	socketMessageMaxSize?: number;
    /**
     * Auth function called before the route execution.
     * @param session Session instance.
     * @default (session, next) => next()
     */
	auth?: (session: Session, next: (err?: any) => void) => void;
	/** Definition of error handling */
	error?: {
		/**
		 * Function to handle errors in the route execution.
		 * @default (err, req, res, next) => next()
		 */
		handler?: <S extends Session = Session>(err: any, req: IRequest<S>, res: IResponse, next: (err?: any) => void) => void;
		/** Error page. */
		page?: any; // TODO
		/** Error layout. */
		layout?: typeof Layout;
	};
    /**
     * Function to handle errors in the route execution.
     * @default (err, req, res, next) => next()
	 * @deprecated
     */
	errorHandler?: <S extends Session = Session>(err: any, req: IRequest<S>, res: IResponse, next: (err?: any) => void) => void;
    /**
     * Indicates if the bundle is loaded relatively in the output html.
     * @default false
     */
	bundlePathRelative?: boolean;
    /**
     * Function to handle webpack progress.
     * @default null
     */
	onWebpackProgress?: (percents: number, message: string) => void;
    /**
     * Custom webpack config.
     * @default {}
     */
	webpack?: any;
    /**
     * Custom socketIO config.
     * @default {}
     */
	socketIO?: SocketServerOptions;
	/**
	 * Custom autoprefixer config.
	 * @default {}
	 */
	autoprefixer?: any;
	/**
	 * List of modules to add to the babel-loader.
	 * @default []
	 */
	babelTranspileModules?: Array<string>;
	/**
	 * Indicates if registered components should be created if missing.
	 * @default false
	 */
	createMissingComponents?: boolean;
	/**
	 * Extension of the generated components.
	 * @default 'tsx'
	 */
	generatedComponentsExtension?: 'js' | 'jsx' | 'ts' | 'tsx';
	/**
	 * Path to the directory containing source styles that are merged to app styles.
	 * @default './[staticDir]/[cssDir]'
	 */
	sourceStylesDir?: string;
	/**
	 * Indicates if the socket should be connected automatically after the bundle load.
	 * @default true
	 */
	connectSocketAutomatically?: boolean;
	/**
	 * Locale settings.
	 */
	locale?: {
		/**
		 * Default locale of the website. This locale will be used in default.json.
		 * @default 'en-US'
		 */
		default?: string;
		/**
		 * List of accepted locales. 
		 * @default []
		 */
		accepted?: Array<string>;
	};
	/**
	 * Indicates if the server logs to the console.
	 * @default true
	 */
	logging?: boolean;
	/**
	 * Indicates if the server should be started before the webpack bundle. In that case bundling info page is rendered.
	 * @default: false
	 */
	bundleAfterServerStart?: boolean;
}

export interface ISocketEvent<S extends Session = Session> {
	event: string;
	listener: (socket: Socket<S>, data: any, next?: (err?: any, data?: any) => void) => void | Promise<any>;
}

/**
 * @typeparam U Type of user prop.
 */
interface ILayoutPropsInitialData<U = any> {
	user: U;
	dev: boolean;
	timestamp: number;
	version: string;
	locale: string;
}

/**
 * Layout props.
 * @typeparam T Additional of the initial data.
 * @typeparam U Type of the user.
 */
export interface ILayoutProps<T = {}, U = any> {
	title: string;
	initialData: ILayoutPropsInitialData<U> & T;
	url: {
		protocol: string;
		hostname: string;
		pathname: string;
	};
	/** @deprecated */
	user?: U;
	scripts?: Array<string>;
	styles?: Array<string>;
	version: string;
	bundle: string;
	charSet?: string;
	lang?: string;
	/** List of ids of the wrappers for rendering components. */
	componentWrappers?: Array<string>;
}

export interface IMiddleware {
	afterRoutes?: boolean;
	callback: (server: Server) => (req: IRequest, res: IResponse, next: (err?: Error) => void) => void;
}

/**
 * Wrapper for the websocket socket.
 * @typeparam S Session type.
 */
export class Socket<S extends Session = Session> {

	/**
	 * Adds new socket and registers all socket events.
	 * This method is called automatically after the socket connection.
	 *
	 * @param socket Socket instance.
	 * @param events List of socket events to register.
	 * @param maxMessageSize Maximal size fo the message.
	 */
	public static add(socket: net.Socket, events: Array<ISocketEvent>, maxMessageSize: number): void;

	/**
	 * Broadcasts socket event with data.
	 *
	 * @param event Event to broadcast.
	 * @param data Data to broadcast.
	 * @param filter Function filters sockets for broadcasting.
	 */
	public static broadcast<T = any>(event: string, data: T, filter: (socket: Socket) => boolean): void;

	/**
	 * Iterates through all registered sockets.
	 *
	 * @param iterator Function called for every socket.
	 */
	public static iterateSockets(iterator: (socket: Socket) => void): void;

	/**
	 * Registers listener for socket state events.
	 * 
	 * @param event Socket event.
	 * @param listener Listener to execute after the socket state event.
	 */
	public static on<S extends Session = Session>(
		event: 'connection' | 'error' | 'disconnect', listener: (socket: Socket<S>) => void,
	): void;
	/**
	 * Registers listener for socket state events.
	 * 
	 * @param event Socket event.
	 * @param listener Function to execute after the socket state event.
	 */
	public static on<S extends Session = Session>(
		event: 'connection' | 'error' | 'disconnect', listener: (socket: Socket<S>, ...args: Array<any>) => void,
	): void;

	/**
	 * Creates new instance of the socket.
	 *
	 * @param socket Socket instance.
	 */
	private constructor(socket: net.Socket);

	/**
	 * Emits event with data.
	 *
	 * @param event Event to emit.
	 * @param data Data to emit.
	 * @typeparam T Data type.
	 */
	public emit<T = any>(event: string, data: T): void;

	/**
	 * Registers listener for registered event.
	 *
	 * @param event Event to listen.
	 * @param listener Function called for event handling.
	 * @typeparam T Data type.
	 */
	public on<T = any>(event: string, listener: (data?: T) => void): void;

	/**
	 * Broadcasts socket event with data.
	 *
	 * @param event Event to broadcast.
	 * @param data Data to broadcast.
	 * @typeparam T Data type.
	 */
	public broadcast(event: string, data: any): void;
	/**
	 * Broadcasts socket event with data.
	 *
	 * @param event Event to broadcast.
	 * @param data Data to broadcast.
	 * @param includeSelf Indicates if the socket should include current socket to broadcast.
	 * @typeparam T Data type.
	 */
	public broadcast(event: string, data: any, includeSelf: boolean): void;
	/**
	 * Broadcasts socket event with data.
	 *
	 * @param event Event to broadcast.
	 * @param data Data to broadcast.
	 * @param includeSelf Indicates if the socket should include current socket to broadcast.
	 * @param filter Function filters sockets for broadcasting.
	 * @typeparam T Data type.
	 */
	public broadcast<T = any>(event: string, data: T, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

	/**
	 * Gets the socket session.
	 */
	public getSession(): S;
}

/**
 * Base session class.
 * @typeparam T User type.
 */
export class Session<T = any> {

	/**
	 * Generates new session ID.
	 */
	public static generateId(): string;

	public static getInstance<T = any>(id: string): Session<T>;

	/**
	 * ID of the session.
	 */
	public id: string;

	/**
	 * Creates new session instance.
	 *
	 * @param id ID of the session.
	 */
	private constructor(id: string);

	/**
	 * Sets the user's data to the session.
	 *
	 * @param user User data.
	 */
	public setUser(user: T): void;

	/**
	 * Gets the user data from the session.
	 */
	public getUser(): T;
}

/**
 * Server layout component.
 */
export class Layout<P = ILayoutProps> extends Component<P> {

	/**
	 * Renders `<head>` tag with charset, metas, title, scripts and styles.
	 */
	public renderHead(): JSX.Element;

	/**
	 * Renders `<body>` tag with with container and bundle data.
	 */
	public renderBody(): JSX.Element;

	/**
	 * Renders container with content div. In the content div are rendered client pages.
	 */
	public renderContainer(): JSX.Element;

	/**
	 * Renders initial data and bundle `<script>` tag.
	 */
	public renderBundleData(): JSX.Element;

	/**
	 * Renders the loader before the content data are rendered.
	 */
	public renderLoader(): JSX.Element;

	/**
	 * Renders the meta tags.
	 * If it's used in inherited Layout `super.renderMeta()` should be called.
	 */
	public renderMeta(): JSX.Element;

	/**
	 * Renders the wrappers for the components in the HTML body.
	 */
	public renderComponentWrappers(): JSX.Element;

	/**
     * Gets the text from the dictionary.
     *
     * @param key Key of the text in the dictionary.
     */
	public getText(key: string): string;
    /**
     * Gets the text from the dictionary.
     *
     * @param key Key of the text in the dictionary.
     * @param args Arguments for text format.
     */
	public getText(key: string, ...args: Array<any>): string;

	/**
	 * Creates path with version parameter.
	 * 
	 * @param path Path of the loaded link.
	 * @param version Version of the app.
	 */
	protected _createPath(path: string, version: string): string;
}

/**
 * Base class for grouping socket events. The event can be called from the client `[lowerCasedClassName].[method]`. 
 * All underscored methods and methods of the base class are ignored in the event list.
 * 
 * @example
 * 
 * ```javascript
 * class User extends SocketClass {
 * 	// This method will be accessible from the client as user.get event.
 * 	async get(socket, data) {
 * 		return { id: 1, name: 'Baf Lek' };
 * 	}
 * }
 * 
 * ```
 */
export class SocketClass<S extends Session = Session> {

	/**
	 * Decorator for the methods to check the logged user before the execution.
	 */
	public static requireAuth: MethodDecorator;

	/**
	 * Decorator for methods to be not registered as socket methods. They cannot be called from socket.
	 */
	public static notSocketMethod: MethodDecorator;

	/**
	 * Decorator for the methods to broadcast the response after the execution.
	 */
	public static broadcast: (filter?: (socket: Socket) => boolean, event?: string, includeSelf?: boolean) => MethodDecorator;

	/**
	 * Converts the methods to the list of events. 
	 * The method is called automatically from the `Server`.
	 */
	public getEvents(): Array<ISocketEvent<S>>;

	/**
	 * Broadcasts the event and data to the clients except the sender.
	 *
	 * @param event Event name.
	 * @param data Data to broadcast.
	 * @typeparam T Type of the data.
	 * @deprecated
	 */
	broadcast<T = any>(event: string, data: T): void;
	/**
	 * Broadcasts the event and data to the clients.
	 *
	 * @param event Event name.
	 * @param data Data to broadcast.
	 * @param includeSelf Indicates if the broadcast should include the sender.
	 * @typeparam T Type of the data.
	 * @deprecated
	 */
	broadcast<T = any>(event: string, data: T, includeSelf: boolean): void;
	/**
	 * Broadcasts the event and data to the clients passed the filter.
	 *
	 * @param event Event name.
	 * @param data Data to broadcast.
	 * @param includeSelf Indicates if the broadcast should include the sender.
	 * @param filter Function to filter receivers of the broadcast.
	 * @typeparam T Type of the data.
	 * @deprecated
	 */
	broadcast<T = any>(event: string, data: T, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

}

/**
 * Base class for plugins. The plugin must extend this class.
 */
export abstract class Plugin {

	/**
	 * Registers the plugin to the server instance.
	 *
	 * @param server The server instance.
	 */
	public register(server: Server): Promise<void>;

	/**
	 * Gets the name of the plugin.
	 */
	public abstract getName(): string;

	/**
	 * Gets the list of javascript code to inject in the generated entry file.
	 */
	protected getEntryInjections(): Array<string>;

	/**
	 * Gets the list of socket classes to register.
	 */
	protected getSocketClasses(): Array<typeof SocketClass>;

	/**
	 * Gets the list of socket events to register.
	 */
	protected getSocketEvents(): Array<ISocketEvent>;

	/**
	 * Gets the list of route callbacks.
	 */
	protected getRouteCallbacks(): Array<{ route: string, callback: RouteCallback }>;

	/**
	 * Gets the list of callbacks called before the route execution.
	 */
	protected getBeforeExecutions(): Array<{ spec: string, callback: <R extends IRequest>(req: R, res: IResponse) => Promise<void> }>;

	/**
	 * Gets the list of scripts to require in the html header.
	 */
	protected getScripts(): Array<string>;

	/**
	 * Gets the list of styles to require in the html header.
	 */
	protected getStyles(): Array<string>;

	/**
	 * Gets the list of styles to merge in the rs app css.
	 */
	protected getMergeStyles(): Array<string>;

	/**
	 * Gets the list of middlewares.
	 */
	protected getMiddlewares(): Array<IMiddleware>;

	/**
	 * Gets the path to component provider.
	 */
	protected getComponentProvider(): string;
}

export { HttpSmartError as HttpError };

/**
 * Helper for register routes, components and socket class directory.
 * @deprecated Use `rsconfig.json` instead.
 */
export namespace Utils {
    /**
     * Registers socket classes to the server app.
     * 
     * @param app Server instance.
     * @param dir Path to the directory with socket classes.
     */
	export function registerSocketClassDir(app: Server, dir: string): void;
    /**
     * Registers routes to the server app.
     * 
     * @param app Server instance.
     * @param routes List of routes to register.
     */
	export function registerRoutes(
		app: Server,
		routes: Array<{
			method?: HttpMethod;
			route: string;
			component: string;
			title: string;
			requireAuth?: boolean;
			layout?: string | typeof Layout;
		}>
	): void;
    /**
     * Registers components to the server app.
     * 
     * @param app Server instance.
     * @param components List of components to register.
     */
	export function registerComponents(app: Server, components: Array<{ id: string, component: string, auto?: boolean }>): void;
}

/**
 * Base server application.
 */
export default class Server {

	/**
	 * Port number where the app listens.
	 */
	port: number;
	/**
	 * Relative path to the static dir.
	 */
	staticDir: string;
	/**
	 * Absolute path to the static dir.
	 */
	staticDirAbsolute: string;
	/**
	 * Indicates if the app is in DEV mode.
	 */
	dev: boolean;
	/**
	 * Absolute path to the javascript directory for the webpack config.
	 */
	path: string;
	/**
	 * Bundle path in the website structure.
	 */
	bundlePath: string;
	/**
	 * Absolute path to the bundle file in the application structure.
	 */
	bundlePathAbsolute: string;
	/**
	 * Relative path to the application directory.
	 */
	appDir: string;
	/**
	 * Absolute path to the application directory.
	 */
	appDirAbsolute: string;
	/**
	 * JSX class for the layout component.
	 */
	Layout: JSX.Element;
	/**
	 * Session class.
	 */
	Session: typeof Session;
	/**
	 * Instance of the Text.
	 */
	Text: TextType;
	/**
	 * CSP nonce.
	 */
	nonce: string;
	/**
	 * App version.
	 */
	version: string;
	/**
	 * Indicates if the webpack is bundling.
	 */
	bundling: boolean;

	constructor(config?: IAppConfig);

    /**
     * Gets the instance of the server.
     */
	getServer(): http.Server;
    /**
     * Gets the instance of express application.
     */
	getApp(): express.Application;

	/**
	 * Gets the text from the locale dictionary.
	 *
	 * @param locale
	 * @param key 
	 * @param args 
	 */
	getLocaleText(locale: string, key: string, ...args: Array<any>): string;

	/**
	 * Gets the filename of the dictionary file in the resources directory.
	 *
	 * @param locale Locale to check.
	 */
	getLocaleFileName(locale: string): string;

	/**
	 * Checks if the locale is default locale.
	 *
	 * @param locale Locale to check.
	 */
	isLocaleDefault(locale: string): boolean;

	/**
	 * Gets the server config.
	 */
	getConfig(): IAppConfig;
	/**
	 * Gets the server config by it's key.
	 *
	 * @param key Key of the config field.
	 */
	getConfig<K extends keyof IAppConfig>(key: K): IAppConfig[K];

    /**
     * Gets the list of registered socket events.
     */
	getSocketEvents(): Array<ISocketEvent>;

    /**
     * Gets the list of registered socket classes.
     */
	getSocketClasses(): Array<SocketClass>;

	/**
	 * Gets the list of registered components.
	 */
	getRegisteredComponents(): Array<{ elementId: string, path: string, auto: boolean }>;

    /**
     * Authorizes the user.
     *
     * @param session Current session.
     * @param next Callback after the auth process.
     */
	auth(session: Session, next: (err?: any) => void): void;

	registerRoute(method: HttpMethod, route: string, contentComponent: string, title: string): this;
	registerRoute(method: HttpMethod, route: string, contentComponent: string, title: string, requireAuth: boolean): this;
    /**
     * Registers route.
     *
     * @param method 
     * @param route 
     * @param contentComponent 
     * @param title 
     * @param requireAuth 
     * @param callback 
     */
	registerRoute(method: HttpMethod, route: string, contentComponent: string, title: string, requireAuth: boolean, callback: Function): this;
    /**
     * Registers route.
     *
     * @param method 
     * @param route 
     * @param contentComponent 
     * @param title 
     * @param requireAuth 
     * @param layout
     * @param callback 
     */
	registerRoute(
		method: HttpMethod,
		route: string,
		contentComponent: string,
		title: string,
		requireAuth: boolean,
		layout: typeof Layout | string,
		callback: Function
	): this;

	/**
	 * Registers callback to route registered with rsconfig.
	 *
	 * @param route Route spec.
	 * @param callback Callback to call when the route is called.
	 */
	registerRouteCallback(route: string, callback: RouteCallback): this;

	registerSocketClass(cls: typeof SocketClass): this;
    /**
     * Registers the socket class.
     *
     * @param cls Socket class to register.
     */
	registerSocketClass(cls: new () => SocketClass<Session>): this;

    /**
     * Registers the socket event.
     *
     * @param event Name of the event.
     * @param listener Listener executed in the event.
     */
	registerSocketEvent(event: string, listener: ISocketEvent['listener']): this;

    /**
     * Registers component.
     *
     * @param componentPath Absolute path or relative path to the component from the app directory.
     * @param elementId Id of the element in the layout where the component should be rendered.
     */
	registerComponent(componentPath: string, elementId: string): this;

	 /**
     * Registers component.
     *
     * @param componentPath Absolute path or relative path to the component from the app directory.
     * @param elementId Id of the element in the layout where the component should be rendered.
	 * @param auto Indicates if the component's wrapper should be automatically rendered in the layout's body.
     */
	registerComponent(componentPath: string, elementId: string, auto: boolean): this;

	/**
	 * Registers the component provider. All components rendered with the application are wrapped with this provider.
	 *
	 * @param path Absolute path or relative path to the component provider.
	 */
	registerComponentProvider(path: string): this;

	/**
	 * Registers the error page.
	 * 
	 * @param componentPath Relative path to the component from the app directory.
	 * @deprecated
	 */
	registerErrorPage(componentPath: string): this;

	/**
	 * Registers the callback executing before the route execution.
	 *
	 * @param spec Route specification. If '*' is used the callback is called for every route.
	 * @param callback Callback to execute before the route execution.
	 */
	registerBeforeExecution<R extends IRequest = IRequest>(
		spec: string, callback: (req: R, res: IResponse) => Promise<void>,
	): this;

	/**
	 * Registers the plugin.
	 *
	 * @param plugin Instance of plugin.
	 */
	registerPlugin(plugin: Plugin): this;

	/**
	 * Registers the middleware.
	 *
	 * @param middleware Middleware to register.
	 */
	registerMiddleware(middleware: IMiddleware['callback']): this;
	/**
	 * Registers the middleware.
	 *
	 * @param middleware Middleware to register.
	 * @param afterRoutes Indicates if the middleware should be executed after the routes register.
	 */
	registerMiddleware(middleware: IMiddleware['callback'], afterRoutes: boolean): this;

	/**
	 * Injects the code to the generated entry file.
	 *
	 * @param code Javascript code to inject.
	 */
	injectToEntry(code: string): this;

	/**
	 * Creates a file in RS directory.
	 *
	 * @param filename Name of the file.
	 * @param data File content of async function to get the content.
	 */
	createRSFile(filename: string, data: string | Buffer | (() => Promise<string | Buffer>)): this;

	/**
	 * Logs the info in the stdout.
	 * 
	 * @param tag Tag of the message.
	 * @param message Message.
	 * @param args Another arguments to log.
	 */
	logInfo(tag: string, message: string, ...args: Array<any>): void;

	/**
	 * Logs the warning in the stdout.
	 * 
	 * @param tag Tag of the message.
	 * @param message Message.
	 * @param args Another arguments to log.
	 */
	logWarning(tag: string, message: string, ...args: Array<any>): void;

	/**
	 * Logs the error in the stderr.
	 * 
	 * @param tag Tag of the message.
	 * @param message Message.
	 * @param args Another arguments to log.
	 */
	logError(tag: string, message: string, ...args: Array<any>): void;

    /**
     * Starts the application.
     *
     * @param cb Callback called after the application is started.
     */
	start(cb?: (err?: any) => void): Promise<void>;

	/**
     * Stops the application.
     */
	stop(): void;
	/**
	 * Stops the application.
	 * 
	 * @param cb Callback called after the server stopped.
	 */
	stop(cb?: (err?: Error) => void): void;
}