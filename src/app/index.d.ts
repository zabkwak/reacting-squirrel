import { Component as BaseComponent, ButtonHTMLAttributes } from 'react';
import * as url from 'url';
import Type, { Model } from 'runtime-type';

/**
 * Base client application.
 */
declare class Application extends CallbackEmitter {

    /**
     * Indicates if the application is in dev mode.
     */
	DEV: boolean;
	/** @deprecated */
	initialData: any;

    /**
     * Gets the initial data registered to the app.
     *
     * @typeparam T Definition of the returned data.
     */
	getInitialData<T = any>(): T;
    /**
     * Gets the initial data value by its key.
     *
     * @typeparam T Definition of the returned data.
     * @param key Key in the initial data.
     */
	getInitialData<T = any>(key: string): T;

    /**
     * Registers the routing map.
     * 
     * This method is called automatically in after the bundle load.
     *
     * @param routingMap Map of routes.
     */
	registerRoutingMap(routingMap: Array<{ spec: string, component: Page, title: string }>): this;

    /**
     * Registers socket events.
     * 
     * This method is called automatically in after the bundle load.
     *
     * @param events List of socket events.
     */
	registerSocketEvents(events: Array<string>): this;

    /**
     * Registers custom components.
     * 
     * This method is called automatically in after the bundle load.
     * 
     * @param components List of components.
     */
	registerComponents(components: Array<{ elementId: string, component: BaseComponent }>): this;

	/**
	 * Registers error page for rendering errors.
	 * 
	 * This method is called automatically in the bundle load.
	 * 
	 * @param errorPage ErrorPage component to register.
	 */
	registerErrorPage(errorPage: typeof ErrorPage): this;

    /**
     * Starts the application.
     *
     * This method is called automatically in after the bundle load.
     */
	start(): void;

    /**
     * Forces the content refresh.
     */
	refreshContent(): void;

    /**
     * Renders the route's component.
     * 
     * @param route Route to render.
     */
	render(route: Route): void;
    /**
     * Renders the route's component.
     * 
     * @param route Route to render.
     * @param refresh Indicates if the component of the route should be refreshed if the route is currently rendered.
     */
	render(route: Route, refresh: boolean): void;

    /**
     * Renders the component to the target.
     * 
     * @param component The component.
     * @param target The target DOM element
     */
	renderComponent(component: JSX.Element, target: HTMLElement): void;
    /**
     * Renders the component to the target.
     * 
     * @param component The component.
     * @param target The target DOM element
     * @param callback Function called after the render.
     */
	renderComponent(component: JSX.Element, target: HTMLElement, callback: () => void): void;

    /**
     * Alias for the `navigate` method with the refreshing the content.
     * 
     * @param path URL path.
     */
	redirect(path: string): void;
    /**
     * Alias for the `navigate` method with the refreshing the content.
     * 
     * @param path URL path.
     * @param q Query string data.
     */
	redirect(path: string, q: { [key: string]: string }): void;

    /**
     * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
     * 
     * @param path URL path.
     */
	navigate(path: string): void;
    /**
     * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
     * 
     * @param path URL path.
     * @param q Query string data.
     * 
     */
	navigate(path: string, q: { [key: string]: string }): void;
    /**
     * Pushes the state to the history and renders the route if it's not the current route and refresh is false.
     * 
     * @param path URL path.
     * @param q Query string data.
     * @param refresh Indicates if the route should be refreshed if the route is currently rendered.
     */
	navigate(path: string, q: { [key: string]: string }, refresh: boolean): void;

    /**
     * Pushes the state to the history.
     *
     * @param path URL path.
     * @param q Query string data.
     */
	pushState(path: string, q: { [key: string]: string }): void;

    /**
     * Sets the page title.
     *
     * @param title Title of the page.
     */
	setTitle(title: string): void;

	/**
	 * Sets the locale as a dictionary.
	 *
	 * @param locale Locale dictionary to set.
	 */
	setLocale(locale: string): void;

    /**
     * Registers the component as the context reference.
     *
     * @typeparam T Type of the component.
     * @param ref Component's reference.
     * @param key Key of the reference.
     */
	setRef<T = any>(ref: T, key: string): void;

    /**
     * Gets the component registered in the application context.
     *
     * @typparam T Type of the component.
     * @param key Key of the reference.
     */
	getRef<T = any>(key: string): T;

	/**
	 * Logs the message to the console using `console.log` if the app is in DEV mode.
	 *
	 * @param message 
	 * @param optionalParams 
	 */
	logInfo(message: string, ...optionalParams: Array<any>): void;

	/**
	 * Logs the message to the console using `console.warn` if the app is in DEV mode.
	 *
	 * @param message 
	 * @param optionalParams 
	 */
	logWarning(message: string, ...optionalParams: Array<any>): void;

	/**
	 * Logs the message to the console using `console.error` if the app is in DEV mode.
	 *
	 * @param message 
	 * @param optionalParams 
	 */
	logError(message: string, ...optionalParams: Array<any>): void;
}

/**
 * Route options for creation.
 */
interface IRouteDefinition {
	/** Specification of the route. */
	spec: string;
	/** Page component to render. */
	component: JSX.Element;
	/** Title of the page. */
	title: string;
	/** Initital data of the page. */
	initialData?: any;
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
}

/**
 * Socket states.
 */
declare type SocketState = 'none' | 'connected' | 'connecting' | 'disconnected';

/**
 * Class for socket communication.
 */
declare class Socket extends CallbackEmitter {

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
	public execute<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;

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
	protected _execute<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;
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
     * @param eky Key of the item in the storage.
     */
	public delete(key: string): void;

    /**
     * Clears the storage.
     */
	public clear(): void;
}

export type EventMap = {
	[key: string]: any;
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
export class CallbackEmitter<T = EventMap> {

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
     * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
     *
     * @param key Key of the text in the dictionary.
     */
	public getJSXText(key: string): JSX.Element;
    /**
     * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
     *
     * @param key Key of the text in the dictionary.
     * @param args Arguments for text format.
     */
	public getJSXText(key: string, ...args: Array<any>): JSX.Element;

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
	protected call<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;

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
	protected requestAsync<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;

    /**
     * Calls the socket event.
     *
     * @param event Name of the event.
     * @param callback Callback function.
     * @typeparam R Type of response.
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
     */
	protected request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void): this;
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
     */
	protected request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void, onProgress: (progress: number) => void): this;

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
}

//#endregion

//#region Page

/**
 * Interface for Page props initialData.
 *
 * @typeparam U Type of user prop.
 */
interface IInitialDataProps<U> {
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
export class Page<P extends IPageProps = { params: any, query: any, initialData: IInitialDataProps<any> }, S = {}, SS = any> extends SocketComponent<P, S, SS> {

	/**
     * Sets the page title.
     *
     * @param title Title of the page.
     */
	public setTitle(title: string): void;

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
interface IDataComponentProps extends React.HTMLProps<DataComponent> {
    /**
     * List of events to load after the component did mount.
     */
	events: Array<{
		/** Name of the event. */
		name: string,
		/** Parameters for the event. */
		params?: any,
		/** The key where the response data are stored in the `renderData` function. */
		key?: string,
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
	renderError?: (error: { message: string, code: string }, component: this) => JSX.Element;
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
}

/**
 * Component to handle rendering of socket data.
 */
export class DataComponent extends SocketComponent<IDataComponentProps> {

    /**
     * Reloads the data.
     */
	public load(): void;
}

//#endregion

//#region Button

interface IButtonProps {
	href?: string;
	refreshContent?: boolean;
}

/**
 * Component for navigation throught the application. The click event calls {Application.navigate} method.
 * @deprecated
 */
export class Button extends BaseComponent<IButtonProps & React.ButtonHTMLAttributes<Button>> { }

//#endregion

//#region Text

/**
 * Interface for text component props.
 */
interface ITextProps extends React.HTMLProps<Text> {
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
     */
	static get(key: string, ...args: any[]): string;

    /**
     * Gets the text from the dictionary as JSX object. All HTML in the text is converted to JSX.
     *
     * @param key Key of the text in the dictionary.
     * @param args Arguments for text format.
     */
	static getJSX(key: string, ...args: any[]): JSX.Element;

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
	static formatJSX(key: string, ...args: any[]): JSX.Element;
}

//#endregion

//#region Loader

/**
 * Interface for loader component props.
 */
interface ILoaderProps {
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
export class Loader extends BaseComponent<ILoaderProps> { }

//#endregion

//#region ErrorPage

interface IErrorPageProps extends IPageProps {
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
	R as Router,
	S as Socket,
	ST as Storage,
	Type,
	Model,
}