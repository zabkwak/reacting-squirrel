import { Component as BaseComponent, ButtonHTMLAttributes } from 'react';
import * as url from 'url';

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
     * Starts the application.
     *
     * This method is called automatically in after the bundle load.
     */
    start(): void;
    /**
     * Starts the application.
     *
     * This method is called automatically in after the bundle load.
     * 
     * @param connectSocket Indicates if the socket should be connected.
     */
    start(connectSocket: boolean): void;

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
}

declare class Route {

    static create(route: { spec: string, component: JSX.Element, title: string, initialData?: any }): Route;

    constructor(spec: string, component: JSX.Element, title: string);
    constructor(spec: string, component: JSX.Element, title: string, initialData: any);

    getComponent(): JSX.Element;
}

declare class Router {

    addRoute(route: Route): this;

    getRoute(): Route;

    pushState(): void;
    pushState(path: string): void;
    pushState(path: string, q: { [key: string]: string }): void;

    parseUrl(): url.Url;
    parseUrl(params: boolean): url.Url;

    getParams(): { [key: string]: string };
}

declare type SocketState = 'none' | 'connected' | 'connecting' | 'disconnected';

declare class Socket {

    readonly STATE_NONE: 'none';

    readonly STATE_CONNECTING: 'connecting';

    readonly STATE_CONNECTED: 'connected';

    readonly STATE_DISCONNECTED: 'disconnected';

    private _state: SocketState;

    setChunkSize(chunkSize: number): this;

    setMaxMessageSize(maxMessageSize: number): this;

    registerSocketEvents(events: Array<string>): void;

    connect(): void;
    connect(address: string): void;

    emit(event: string): this;
    emit(event: string, key: string): this;
    emit<P = any>(event: string, key: string, data: P): this;
    emit<P = any>(event: string, key: string, data: P, onProgress: (progress: number) => void): this;

    disconnect(): void;

    getState(): string;

    isConnected(): boolean;
}

declare class Storage {

    size(): number;

    has(key: string): boolean;

    set(key: string, data: any): void;

    get(key: string): any;
    get<T>(key: string): T;

    delete(key: string): void;

    clear(): void;
}

/**
 * Simple class to handle callbacks.
 */
export class CallbackEmitter {

    /**
     * Registers the listener of the event.
     *
     * @param event Name of the event.
     * @param listener Listener to execute when the event is called.
     */
    public addListener(event: string, listener: (self: this) => void): this;
    /**
     * Registers the listener of the event.
     *
     * @param event Name of the event.
     * @param listener Listener to execute when the event is called.
     */
    public addListener(event: string, listener: (self: this, args: any) => void): this;

    /**
     * Removes the listener of the event.
     *
     * @param event Name of the event.
     * @param listener 
     */
    public removeListener(event: string, listener: (self: this) => void): this;
    /**
     * Removes the listener of the event.
     *
     * @param event Name of the event.
     * @param listener 
     */
    public removeListener(event: string, listener: (self: this, args: any) => void): this;

    /**
     * Calls all listeners registered in the event.
     *
     * @param event Name of the event.
     */
    protected _callListener(event: string): void;
    /**
     * Calls all listeners registered in the event.
     *
     * @param event Name of the event.
     * @param args Data to send in the event.
     */
    protected _callListener(event: string, args: any): void;

    /**
     * Checks if the emitter has registerd event.
     *
     * @param event Name of the event.
     */
    protected _hasEventRegistered(event: string): boolean;
}

//#region COMPONENTS

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

    /**
     * Called if the socket changes its state.
     *
     * @param state Current state of the socket.
     */
    protected onSocketStateChanged(state: SocketState): void;

    /**
     * Called if some socket error appeares.
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
     * Called after the page is rendered.
     */
    protected onPageRender(): void;
}

// #endregion

//#region DataComponent

interface IDataComponentProps extends React.HTMLProps<DataComponent> {
    events: Array<{ name: string, params?: any, key?: string }>;
    renderData: (data: any) => JSX.Element;
    renderError?: (error: { message: string, code: string }, component: this) => JSX.Element;
    onError?: (error: any) => void;
    onData?: (data: any) => any;
    onStart?: () => void;
    loaderBlock?: boolean;
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

interface ITextProps extends React.HTMLProps<Text> {
    dictionaryKey: string;
    tag?: string | Node;
    args?: Array<any>;
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

interface ILoaderProps {
    loaded: boolean;
    size?: 'large' | 'normal' | 'small' | 'xsmall';
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

export default Application;

export {
    Application,
    Router,
    Socket,
    Storage,
}