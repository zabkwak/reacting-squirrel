import { Component as BaseComponent } from 'react';
import Type, { Model } from 'runtime-type';
import { CookieSetOptions } from 'universal-cookie';
import * as url from 'url';

declare type TApplicationEventMap = {
	popstate: any;
	start: undefined;
	refresh: undefined;
	pagerender: Page;
	'locale.set': string;
	log: {
		severity: 'info' | 'warn' | 'error';
		message: string;
		args: any;
		component: boolean;
	};
};

declare type TSocketEventMap = {
	'event-error': { event: string; error: any };
	connecting: undefined;
	connected: undefined;
	disconnected: undefined;
};

declare type TEventMap = {
	[key: string]: any;
};

/**
 * Base client application.
 */
declare class Application extends CallbackEmitter<TApplicationEventMap> {
	public LOCALE_COOKIE_NAME: string;

	/**
	 * Indicates if the application is in dev mode.
	 */
	public DEV: boolean;
	/** @deprecated */
	public initialData: any;

	/**
	 * Gets the initial data registered to the app.
	 *
	 * @typeparam T Definition of the returned data.
	 */
	public getInitialData<T = any>(): T;
	/**
	 * Gets the initial data value by its key.
	 *
	 * @typeparam T Definition of the returned data.
	 * @param key Key in the initial data.
	 */
	public getInitialData<T = any>(key: string): T;

	/**
	 * Gets the current set locale.
	 */
	public getLocale(): string;

	/**
	 * Gets the code of the default locale.
	 */
	public getDefaultLocale(): string;

	/**
	 * Gets the list of all accepted locales.
	 */
	public getLocales(): string[];

	/**
	 * Gets the content of `title` tag.
	 */
	public getTitle(): string;

	/**
	 * Registers the routing map.
	 *
	 * This method is called automatically in after the bundle load.
	 *
	 * @param routingMap Map of routes.
	 */
	public registerRoutingMap(routingMap: Array<{ spec: string; component: Page; title: string }>): this;

	/**
	 * Registers socket events.
	 *
	 * This method is called automatically in after the bundle load.
	 *
	 * @param events List of socket events.
	 */
	public registerSocketEvents(events: Array<string>): this;

	/**
	 * Registers custom components.
	 *
	 * This method is called automatically in after the bundle load.
	 *
	 * @param components List of components.
	 */
	public registerComponents(components: Array<{ elementId: string; component: BaseComponent }>): this;

	/**
	 * Registers error page for rendering errors.
	 *
	 * This method is called automatically in the bundle load.
	 *
	 * @param errorPage ErrorPage component to register.
	 */
	public registerErrorPage(errorPage: typeof ErrorPage): this;

	/**
	 * Registers the configuration of locale.
	 *
	 * @param defaultLocale The code of the default locale.
	 * @param accepted List of all accepted locale codes.
	 */
	public registerLocales(defaultLocale: string, accepted: string[]): this;

	/**
	 * Starts the application.
	 *
	 * This method is called automatically in after the bundle load.
	 */
	public start(): void;

	/**
	 * Forces content and components to refresh.
	 */
	public refresh(): void;

	/**
	 * Forces the content refresh.
	 */
	public refreshContent(): void;

	/**
	 * Forces all registered component to refresh.
	 */
	public refreshComponents(): void;

	/**
	 * Renders the route's component.
	 *
	 * @param route Route to render.
	 */
	public render(route: Route): void;
	/**
	 * Renders the route's component.
	 *
	 * @param route Route to render.
	 * @param refresh Indicates if the component of the route should be refreshed if the route is currently rendered.
	 */
	public render(route: Route, refresh: boolean): void;

	/**
	 * Renders the page component.
	 *
	 * @param page Page component.
	 */
	public renderPage(page: Page): void;

	/**
	 * Renders the component to the target.
	 *
	 * @param component The component.
	 * @param target The target DOM element
	 */
	public renderComponent(component: JSX.Element, target: HTMLElement): void;
	/**
	 * Renders the component to the target.
	 *
	 * @param component The component.
	 * @param target The target DOM element
	 * @param callback Function called after the render.
	 */
	public renderComponent(component: JSX.Element, target: HTMLElement, callback: () => void): void;

	/**
	 * Alias for the `navigate` method with the refreshing the content.
	 *
	 * @param path URL path.
	 */
	public redirect(path: string): void;
	/**
	 * Alias for the `navigate` method with the refreshing the content.
	 *
	 * @param path URL path.
	 * @param q Query string data.
	 */
	public redirect(path: string, q: { [key: string]: string }): void;

	/**
	 * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
	 *
	 * @param path URL path.
	 */
	public navigate(path: string): void;
	/**
	 * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
	 *
	 * @param path URL path.
	 * @param q Query string data.
	 *
	 */
	public navigate(path: string, q: { [key: string]: string }): void;
	/**
	 * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
	 *
	 * @param path URL path.
	 * @param q Query string data.
	 * @param refresh Indicates if the route should be refreshed if the route is currently rendered.
	 */
	public navigate(path: string, q: { [key: string]: string }, refresh: boolean): void;

	/**
	 * Pushes the state to the history.
	 *
	 * @param path URL path.
	 * @param q Query string data.
	 */
	public pushState(path: string, q: { [key: string]: string }): void;

	/**
	 * Sets the page title.
	 *
	 * @param title Title of the page.
	 */
	public setTitle(title: string): void;

	/**
	 * Sets the locale as a dictionary.
	 *
	 * @param locale Locale dictionary to set.
	 */
	public setLocale(locale: string): void;

	/**
	 * Registers the component as the context reference.
	 *
	 * @typeparam T Type of the component.
	 * @param ref Component's reference.
	 * @param key Key of the reference.
	 */
	public setRef<T = any>(ref: T, key: string): void;

	/**
	 * Sets the cookie.
	 *
	 * @param name Name of the cookie.
	 * @param value Value of the cookie.
	 */
	public setCookie(name: string, value: any): void;
	/**
	 * Sets the cookie.
	 *
	 * @param name Name of the cookie.
	 * @param value Value of the cookie.
	 * @param options Additional options of the cookie.
	 */
	public setCookie(name: string, value: any, options: CookieSetOptions): void;

	/**
	 * Gets the component registered in the application context.
	 *
	 * @typparam T Type of the component.
	 * @param key Key of the reference.
	 */
	public getRef<T = any>(key: string): T;

	/**
	 * Gets the cookie by its name.
	 */
	public getCookie(name: string): any;

	/**
	 * Logs the message to the console using `console.log` if the app is in DEV mode.
	 * Also sends `log` event of the `Application`.
	 *
	 * @param message
	 * @param optionalParams
	 */
	public logInfo(message: string, ...optionalParams: Array<any>): void;

	/**
	 * Logs the message to the console using `console.warn` if the app is in DEV mode.
	 * Also sends `log` event of the `Application`.
	 *
	 * @param message
	 * @param optionalParams
	 */
	public logWarning(message: string, ...optionalParams: Array<any>): void;

	/**
	 * Logs the message to the console using `console.error` if the app is in DEV mode.
	 * Also sends `log` event of the `Application`.
	 *
	 * @param message
	 * @param optionalParams
	 */
	public logError(message: string, ...optionalParams: Array<any>): void;

	/**
	 * Logs the message to the console using `console.error` if the app is in DEV mode.
	 * Also sends `log` event of the `Application`. The event is flagged as `component: true`.
	 *
	 * @param message
	 * @param optionalParams
	 */
	public logComponentError(message: string, ...optionalParams: Array<any>): void;
}

/**
 * Route options for creation.
 */
export interface IRouteDefinition {
	/** Specification of the route. */
	spec: string;
	/** Page component to render. */
	component: JSX.Element;
	/** Title of the page. */
	title: string;
	/** Initital data of the page. */
	initialData?: any;
	/** Hash of the layout. */
	layout?: string;
}

declare class Route {
	/** Specification of the route. */
	public spec: string;
	/** Page component to render. */
	public component: JSX.Element;
	/** Title of the page. */
	public title: string;
	/** Initital data of the page. */
	public initialData: any;
	/** Hash of the layout. */
	public layout: string;

	/**
	 * Creates new route instance from definition.
	 *
	 * @param route Route definition.
	 */
	public static create(route: IRouteDefinition): Route;

	/**
	 * Creates new route.
	 *
	 * @param spec Specification of the route.
	 * @param component Page component to render.
	 * @param title Title of the page.
	 */
	public constructor(spec: string, component: JSX.Element, title: string);
	/**
	 * Creates new route.
	 *
	 * @param spec Specification of the route.
	 * @param component Page component to render.
	 * @param title Title of the page.
	 * @param initialData Initial data of the page.
	 */
	public constructor(spec: string, component: JSX.Element, title: string, initialData: any);

	/**
	 * Gets the page component to render.
	 */
	public getComponent(): JSX.Element;
}

/**
 * Base application router.
 */
declare class Router {
	/**
	 * Defined routes.
	 */
	private _routes: { [spec: string]: Route };

	/**
	 * Registers the route to the router.
	 *
	 * @param route Route to register.
	 */
	public addRoute(route: Route): this;

	/**
	 * Gets the current route.
	 */
	public getRoute(): Route;

	/**
	 * Finds the route based on the path.
	 *
	 * @param path The path of the route.
	 */
	public findRoute(path: string): Route;

	/**
	 * Pushes the state to the history.
	 */
	public pushState(): void;
	/**
	 * Pushes the state to the history.
	 *
	 * @param path URL path.
	 */
	public pushState(path: string): void;
	/**
	 * Pushes the state to the history.
	 *
	 * @param path URL path.
	 * @param q Query string data.
	 */
	public pushState(path: string, q: { [key: string]: string }): void;

	/**
	 * Parses current url.
	 */
	public parseUrl(): url.Url;
	/**
	 * Parses current url.
	 *
	 * @param params Indicates if the route params are returned with the url.
	 */
	public parseUrl(params: boolean): url.Url & { [key: string]: string };

	/**
	 * Gets current route params.
	 */
	public getParams(): { [key: string]: string };

	/**
	 * Stringifies actual query with additional params.
	 */
	public stringifyQuery(): string;
	/**
	 * Stringifies actual query with additional params.
	 *
	 * @param q Params to stringify.
	 */
	public stringifyQuery(q: { [key: string]: string }): string;
}

/**
 * Socket states.
 */
declare type SocketState = 'none' | 'connected' | 'connecting' | 'disconnected';

/**
 * Class for socket communication.
 */
declare class Socket extends CallbackEmitter<TSocketEventMap> {
	/** Unknown state of the socket. */
	public readonly STATE_NONE: 'none';

	/** The socket is connecting to the server. */
	public readonly STATE_CONNECTING: 'connecting';

	/** The socket is connected to the server. */
	public readonly STATE_CONNECTED: 'connected';

	/** The socket is disconnected from the server. */
	public readonly STATE_DISCONNECTED: 'disconnected';

	/** Current state of the socket */
	private _state: SocketState;

	/**
	 * Sets the chunk size of socket message.
	 *
	 * @param chunkSize Size of the chunk.
	 */
	public setChunkSize(chunkSize: number): this;

	/**
	 * Sets the maximal size of the socket message.
	 *
	 * @param maxMessageSize Maximal message size.
	 */
	public setMaxMessageSize(maxMessageSize: number): this;

	/**
	 * Registers socket events.
	 *
	 * This method is called automatically in after the bundle load.
	 *
	 * @param events List of socket events.
	 */
	public registerEvents(events: Array<string>): this;

	/**
	 * Connects the client to the server.
	 */
	public connect(): void;
	/**
	 * Connects the client to the server.
	 *
	 * @param address Server address.
	 */
	public connect(address: string): void;

	/**
	 * Emits the socket event.
	 *
	 * @param event Name of the event.
	 */
	public emit(event: string): this;
	/**
	 * Emits the socket event.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 */
	public emit(event: string, key: string): this;
	/**
	 * Emits the socket event.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 */
	public emit<P = any>(event: string, key: string, data: P): this;
	/**
	 * Emits the socket event.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 */
	public emit<P = any>(event: string, key: string, data: P, onProgress: (progress: number) => void): this;

	/**
	 * Disconnects the client from the server.
	 */
	public disconnect(): void;

	/**
	 * Gets the current state of the socket.
	 */
	public getState(): SocketState;

	/**
	 * Indicates if the socket is connected to the server.
	 */
	public isConnected(): boolean;
}

export class SocketRequest extends CallbackEmitter {
	/**
	 * Decorator for casting response with defined types.
	 * @example
	 * ```javascript
	 * class User extends SocketRequest {
	 * 	@SocketRequest.castResponse({
	 * 		id: Type.integer,
	 * 		name: Type.string,
	 * 	})
	 * 	get() {
	 * 		return this.execute('user.get');
	 * 	}
	 * }
	 * ```
	 */
	public static castResponse: (options: { [key: string]: Type.Type }) => MethodDecorator;

	/**
	 * Registers socket event listener. This method should be called in `componentDidMount`.
	 *
	 * @param event Name of the event.
	 * @param callback Callback for the event.
	 */
	public on<R = any>(event: string, callback: (error?: any, data?: R) => void): this;

	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @typeparam R Type of response.
	 */
	public execute<R = any>(event: string): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	public execute<P = any, R = any>(event: string, data: P): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	public execute<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	public execute<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		onProgress: (progress: number) => void,
	): Promise<R>;

	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @typeparam P Type of parameters.
	 */
	public emit(event: string): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 */
	public emit(event: string, key: string): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 */
	public emit<P = any>(event: string, key: string, data: P): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 */
	public emit<P = any>(event: string, key: string, data: P, onProgress: (progress: number) => void): this;

	/**
	 * Clears all registered listeners.
	 */
	public clearListeners(): void;
}

/**
 * Class for defining models from socket communication.
 */
export class SocketModel extends Model {
	protected _socketRequest: SocketRequest;

	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @typeparam R Type of response.
	 */
	protected _execute<R = any>(event: string): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected _execute<P = any, R = any>(event: string, data: P): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected _execute<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected _execute<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		onProgress: (progress: number) => void,
	): Promise<R>;
}

/**
 * Wrapper for `LocalStorage`.
 */
declare class Storage {
	/**
	 * Gets the size of storage.
	 */
	public size(): number;

	/**
	 * Checks if the storage has the key.
	 * @param key Key of the item in the storage.
	 */
	public has(key: string): boolean;

	/**
	 * Sets the data to the key.
	 *
	 * @param key Key of the item in the storage.
	 * @param data Data to save.
	 */
	public set(key: string, data: any): void;

	/**
	 * Gets the data from the storage.
	 *
	 * @param key Key of the item in the storage.
	 * @typeparam T Type of the returned data.
	 */
	public get<T = any>(key: string): T;

	/**
	 * Removes the item from the storage.
	 *
	 * @param key Key of the item in the storage.
	 */
	public delete(key: string): void;

	/**
	 * Clears the storage.
	 */
	public clear(): void;
}

/**
 * Simple class to handle callbacks.
 * @typeparam T Event map for the listeners as object with event name and the type of the arguments in the callback.
 * @example
 * ```javascript
 * type EventMap = {
 * 	test: number;
 * }
 * class SomeEmitter extends CallbackEmitter<EventMap> {}
 *
 * const emitter = new SomeEmitter();
 * emitter.addListener('test', (e, test) => {
 * 	// e is instance of the emitter
 * 	// test is number
 * })
 * ```
 */
export class CallbackEmitter<T = TEventMap> {
	/**
	 * Registers the listener of the event.
	 *
	 * @param event Name of the event.
	 * @param listener Listener to execute when the event is called.
	 */
	public addListener<K extends keyof T>(event: K, listener: (self: this) => void): this;
	/**
	 * Registers the listener of the event.
	 *
	 * @param event Name of the event.
	 * @param listener Listener to execute when the event is called.
	 */
	public addListener<K extends keyof T>(event: K, listener: (self: this, args: T[K]) => void): this;

	/**
	 * Removes the listener of the event.
	 *
	 * @param event Name of the event.
	 * @param listener
	 */
	public removeListener<K extends keyof T>(event: K, listener: (self: this) => void): this;
	/**
	 * Removes the listener of the event.
	 *
	 * @param event Name of the event.
	 * @param listener
	 */
	public removeListener<K extends keyof T>(event: K, listener: (self: this, args: T[K]) => void): this;

	/**
	 * Clears all listeners on the event.
	 *
	 * @param event Name of the event.
	 */
	public clear<K extends keyof T>(event: K): void;

	/**
	 * Calls all listeners registered in the event.
	 *
	 * @param event Name of the event.
	 */
	protected _callListener<K extends keyof T>(event: K): void;
	/**
	 * Calls all listeners registered in the event.
	 *
	 * @param event Name of the event.
	 * @param args Data to send in the event.
	 */
	protected _callListener<K extends keyof T>(event: K, args: T[K]): void;

	/**
	 * Checks if the emitter has registerd event.
	 *
	 * @param event Name of the event.
	 */
	protected _hasEventRegistered(event: string): boolean;
}

//#region COMPONENTS

//#region Base components
/**
 * Base RS Components.
 * All components in the application should be inherited from this class or its subclasses.
 */
export class Component<P = {}, S = {}, SS = any> extends BaseComponent<P, S, SS> {
	/**
	 * Saved states of the component.
	 */
	private static _stateStorage: { [key: string]: any };

	/**
	 * Indicates if the component is mounted.
	 */
	protected _mounted: boolean;

	public componentDidMount(): void;

	public componentWillUnmount(): void;

	/**
	 * Gets the application context.
	 */
	public getContext(): Application;

	/**
	 * Gets the text from the dictionary.
	 *
	 * @param key Key of the text in the dictionary.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	public getText<T = any>(key: keyof T): string;
	/**
	 * Gets the text from the dictionary.
	 *
	 * @param key Key of the text in the dictionary.
	 * @param args Arguments for text format.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	public getText<T = any>(key: keyof T, ...args: Array<any>): string;

	/**
	 * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
	 *
	 * @param key Key of the text in the dictionary.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	public getJSXText<T = any>(key: keyof T): JSX.Element;
	/**
	 * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
	 *
	 * @param key Key of the text in the dictionary.
	 * @param args Arguments for text format.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	public getJSXText<T = any>(key: keyof T, ...args: Array<any>): JSX.Element;

	/**
	 * Method called after `window.onpopstate` event is triggered.
	 * @param event
	 */
	protected onPopState(event: any): void;

	/**
	 * Saves the current state to the memory storage.
	 *
	 * @param key State key of the component instance.
	 */
	protected saveState(key: string): void;

	/**
	 * Loads the state from the memory storage.
	 *
	 * @param key State key of the component instance.
	 */
	protected loadState(key: string): Promise<void>;

	/**
	 * Gets the state key of the component instance.
	 * By default the method returns `null`.
	 * If it's overriden to return a string value the `saveState` and `loadState` are handled automatically in the component's lifecycle.
	 */
	protected getStateKey(): string;
}

/**
 * Component using Socket API for communication.
 */
export class SocketComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {
	protected _socketRequest: SocketRequest;

	/**
	 * Called if the socket changes its state.
	 *
	 * @param state Current state of the socket.
	 */
	protected onSocketStateChanged(state: SocketState): void;

	/**
	 * Called if some socket error appears.
	 *
	 * @param error Socket error.
	 */
	protected onSocketError(error: any): void;

	/**
	 * Registers socket event listener. This method should be called in `componentDidMount`.
	 *
	 * @param event Name of the event.
	 * @param callback Callback for the event.
	 */
	protected on<R = any>(event: string, callback: (error?: any, data?: R) => void): this;

	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected call<R = any>(event: string): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected call<P = any, R = any>(event: string, data: P): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected call<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected call<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		onProgress: (progress: number) => void,
	): Promise<R>;

	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @typeparam R Type of response.
	 */
	protected requestAsync<R = any>(event: string): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected requestAsync<P = any, R = any>(event: string, data: P): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected requestAsync<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 */
	protected requestAsync<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		onProgress: (progress: number) => void,
	): Promise<R>;

	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param callback Callback function.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected request<R = any>(event: string, callback: (error?: any, data?: R) => void): this;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param callback Callback function.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected request<P = any, R = any>(event: string, data: P, callback: (error?: any, data?: R) => void): this;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param callback Callback function.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected request<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		callback: (error?: any, data?: R) => void,
	): this;
	/**
	 * Calls the socket event.
	 *
	 * @param event Name of the event.
	 * @param data Event parameters.
	 * @param timeout Timeout of the event.
	 * @param callback Callback function.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 * @typeparam R Type of response.
	 * @deprecated
	 */
	protected request<P = any, R = any>(
		event: string,
		data: P,
		timeout: number,
		callback: (error?: any, data?: R) => void,
		onProgress: (progress: number) => void,
	): this;

	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @typeparam P Type of parameters.
	 */
	protected emit(event: string): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 */
	protected emit(event: string, key: string): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @typeparam P Type of parameters.
	 */
	protected emit<P = any>(event: string, key: string, data: P): this;
	/**
	 * Emits the socket event. The response can be handled in the `on` method.
	 *
	 * @param event Name of the event.
	 * @param key Socket event key.
	 * @param data Event parameters.
	 * @param onProgress Function called in the progress tick.
	 * @typeparam P Type of parameters.
	 */
	protected emit<P = any>(event: string, key: string, data: P, onProgress: (progress: number) => void): this;

	/**
	 * Gets a list of events that are registered in `on` method after the component mount and saves the data to the component state.
	 */
	protected getEvents(): Array<{
		/** Name of the event. */
		name: string;
		/** Key in the component state where the data are stored. */
		state: keyof S;
		/** Indicates if the event should be emitted after the mount. */
		emit?: boolean;
		/** Data for the emit. */
		data?: { [key: string]: any };
	}>;
}

//#endregion

//#region Page

/**
 * Interface for Page props initialData.
 *
 * @typeparam U Type of user prop.
 */
export interface IInitialDataProps<U> {
	/**
	 * User data.
	 */
	user: U;
	/**
	 * Indicates if the app is in DEV mode.
	 */
	dev: boolean;
	/**
	 * Render timestamp.
	 */
	timestamp: number;
}

/**
 * Interface for Page props.
 *
 * @typeparam T Another types for the initial data.
 * @typeparam U Type of the user.
 */
export interface IPageProps<T = {}, U = any> {
	/**
	 * Route parameters.
	 */
	params: any;
	/**
	 * Data in query string.
	 */
	query: any;
	/**
	 * Initial data from the server.
	 */
	initialData: IInitialDataProps<U> & T;
}
/**
 * Base component for rendering pages.
 * All registered pages in the application should be inherited from this class.
 */
export class Page<
	P extends IPageProps = { params: any; query: any; initialData: IInitialDataProps<any> },
	S = {},
	SS = any,
> extends SocketComponent<P, S, SS> {
	/**
	 * Sets the page title.
	 *
	 * @param title Title of the page.
	 */
	public setTitle(title: string): void;

	/**
	 * Gets the page title.
	 */
	public getTitle(): string;

	/**
	 * Called after the page is rendered.
	 */
	protected onPageRender(): void;
}

// #endregion

//#region DataComponent

/**
 * Interface for DataComponent props.
 */
export interface IDataComponentProps extends React.HTMLProps<DataComponent> {
	/**
	 * List of events to load after the component did mount.
	 */
	events: Array<{
		/** Name of the event. */
		name: string;
		/** Parameters for the event. */
		params?: any;
		/** The key where the response data are stored in the `renderData` function. */
		key?: string;
		/** Update event. On this event is registered listener for updating the component. */
		update?: string;
	}>;
	/**
	 * Function called for data rendering.
	 *
	 * @param data Loaded data. The event responses are accessible thought the key defined in the `events` or by the event name.
	 */
	renderData: (data: any) => JSX.Element;
	/**
	 * Function called for error rendering.
	 *
	 * @param error The error returned from the socket.
	 * @param component Reference to the component.
	 */
	renderError?: (error: { message: string; code: string }, component: this) => JSX.Element;
	/**
	 * Function called if the error occured before the `renderError`.
	 *
	 * @param error The error returned from the socket.
	 */
	onError?: (error: any) => void;
	/**
	 * Function called after the data load before the `renderData`. The data can be modified here.
	 *
	 * @param data Loaded data. The event responses are accessible thought the key defined in the `events` or by the event name.
	 */
	onData?: (data: any) => any;
	/**
	 * Function called before the socket events execution.
	 */
	onStart?: () => void;
	/**
	 * Indicates if the loader should have block prop set to `true`.
	 */
	loaderBlock?: boolean;
	/**
	 * Loader size.
	 */
	loaderSize?: 'large' | 'normal' | 'small' | 'xsmall';
	/**
	 * Indicates if the took info is disabled in dev mode.
	 */
	tookDisabled?: boolean;
}

/**
 * Component to handle rendering of socket data.
 * @deprecated Use `CachedDataComponent` instead.
 */
export class DataComponent extends SocketComponent<IDataComponentProps> {
	/**
	 * Reloads the data.
	 */
	public load(): void;
}

//#endregion

// #region CachedDataComponent

export interface ICachedDataComponentProps<T> extends React.HTMLProps<CachedDataComponent<T>> {
	/**
	 * The key with which are the data stored in the store.
	 * The property is required if the component is not inherited.
	 */
	dataKey?: string;
	/**
	 * Function called when the data are received.
	 */
	onData?: (data: T) => void;
	/**
	 * Function called if the error occurs during the request.
	 */
	onError?: (error: any) => void;
	/**
	 * Function to load the data.
	 * The property is required if the data component is not inherited.
	 */
	load?: (component: CachedDataComponent<T>) => Promise<T>;
	/**
	 * Function to updated data in the store.
	 * The property is required if the data component is not inherited.
	 */
	update?: (data: T) => Promise<T>;
	/**
	 * Indicates if the component should force load the data on mount.
	 */
	refresh?: boolean;
	/**
	 * The component to render while the data are loading.
	 */
	LoaderComponent?: React.ReactNode;
	/**
	 * Function for rendering the error.
	 */
	renderError?: (error: any) => JSX.Element;
	/**
	 * Function as children for rendering the data.
	 * The property is required if the data component is not inherited.
	 */
	children?: (data: T, component: CachedDataComponent<T>) => JSX.Element;
	/**
	 * Transforms the data before storing.
	 */
	transformData?: (data: T) => T;
}

export interface ICachedDataComponentState<T> {
	data: T;
	error: any;
	loading: boolean;
}

/**
 * Component to handle and store socket data.
 */
export class CachedDataComponent<
	T,
	P extends ICachedDataComponentProps<T> = ICachedDataComponentProps<T>,
> extends SocketComponent<P, ICachedDataComponentState<T>> {
	/**
	 * Renders the loader component.
	 */
	public renderLoader(): JSX.Element;

	/**
	 * Renders the error.
	 * @param error
	 */
	public renderError(error: any): JSX.Element;

	/**
	 * Renders the data.
	 * @param data
	 */
	public renderData(data: T): JSX.Element;

	/**
	 * Loads the data and stores it in the store.
	 */
	public load(): Promise<void>;

	/**
	 * Updates the data.
	 */
	public update(): Promise<void>;

	/**
	 * Clears the data.
	 */
	public clear(): void;

	/**
	 * The actual request to load the data.
	 * This can be overridden for custom loader instead of prop.
	 */
	protected _load(): Promise<T>;

	/**
	 * Handles the data.
	 * @param data
	 */
	protected _handleData(data: T): void;

	/**
	 * Handlers the error.
	 * @param error
	 */
	protected _handleError(error: any): void;

	/**
	 * Transforms the data.
	 * @param data
	 */
	protected _transformData(data: T): T;

	/**
	 * Gets the data key.
	 */
	protected _getDataKey(): string;

	private _hasStoredData(): boolean;

	private _getStoredData(): T;

	private _storeData(data: T): void;
}

// #endregion

//#region Text

/**
 * Interface for text component props.
 */
export interface ITextProps extends React.HTMLProps<Text> {
	/** Key in the dictionary. */
	dictionaryKey: string;
	/** Tag where the text should be rendered. */
	tag?: string | Node;
	/** List of arguments. */
	args?: Array<any>;
	/** Indicates if the value of the dictionary should be converted to JSX. */
	jsx?: boolean;
}
/**
 * Component for rendering texts from dictionary.
 */
export class Text extends BaseComponent<ITextProps> {
	/**
	 * Adds the dictionary to the default dictionary.
	 *
	 * @param dictionary Dictionary data.
	 */
	static addDictionary(dictionary: { [key: string]: string }): Text;
	/**
	 * Adds the dictionary to the specific key.
	 *
	 * @param key Key of the dictionary.
	 * @param dictionary Dictionary data.
	 */
	static addDictionary(key: string, dictionary: { [key: string]: string }): Text;

	/**
	 * Sets the currently active dictionary.
	 *
	 * @param key Key of the dictionary.
	 */
	static setDictionary(key: string): Text;

	/**
	 * Registers function to the text.
	 *
	 * @param name Name of the function.
	 * @param fn Called function.
	 */
	static addFunction(name: string, fn: (...args: any[]) => string): Text;

	/**
	 * Gets the text from the dictionary.
	 *
	 * @param key Key of the text in the dictionary.
	 * @param args Arguments for text format.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	static get<T = any>(key: keyof T, ...args: any[]): string;

	/**
	 * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
	 *
	 * @param key Key of the text in the dictionary.
	 * @param args Arguments for text format.
	 * @typeparam `T` - Type of the dictionary object -> `typeof { key: 'value' }`.
	 */
	static getJSX<T = any>(key: keyof T, ...args: any[]): JSX.Element;

	/**
	 * Formats the text.
	 *
	 * @param text Text to format.
	 * @param args Arguments for text format.
	 */
	static format(text: string, ...args: any[]): string;
	/**
	 * Formats the text with HTML converted to JSX.
	 *
	 * @param text Text to format.
	 * @param args Arguments for text format.
	 */
	static formatJSX(text: string, ...args: any[]): JSX.Element;
}

//#endregion

//#region Loader

/**
 * Interface for loader component props.
 */
export interface ILoaderProps {
	/**
	 * Indicates if the data are loaded. If false the loader is rendered otherwise the children are rendered.
	 */
	loaded: boolean;
	/** Size of the loader. */
	size?: 'large' | 'normal' | 'small' | 'xsmall';
	/** Indicates if the loader should be wrapped with div. */
	block?: boolean;
}

/**
 * Component as placeholder for loading data.
 */
export class Loader extends BaseComponent<ILoaderProps> {}

//#endregion

//#region ErrorPage

export interface IErrorPageProps extends IPageProps {
	error: {
		message: string;
		code: string;
		stack?: string;
	};
}

/**
 * Page for rendering errors.
 */
export class ErrorPage extends Page<IErrorPageProps> {
	/**
	 * Renders the error stack.
	 */
	public renderStack(): JSX.Element;
}

//#endregion

//#endregion

export namespace Utils {
	/**
	 * Function to register to anchors onClick property for using `Application` navigation.
	 *
	 * @param e Html event.
	 */
	export function anchorNavigation(e: any): void;
}

/** Instance of the current application. */
declare const App: Application;
/** Instance of the current router. */
declare const R: Router;
/** Instance of the client socket. */
declare const S: Socket;
/** Instance of the client storage. */
declare const ST: Storage;

export default App;

export {
	App as Application,
	/** @deprecated */
	TEventMap as EventMap,
	Model,
	R as Router,
	S as Socket,
	ST as Storage,
	TApplicationEventMap,
	// Types
	TEventMap,
	TSocketEventMap,
	Type,
};
