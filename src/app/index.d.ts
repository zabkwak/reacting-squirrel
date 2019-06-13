import { Component as BaseComponent, ButtonHTMLAttributes } from 'react';
import * as url from 'url';

/**
 * Base client application.
 */
declare class Application extends CallbackEmitter {

    DEV: boolean;
    /** @deprecated */
    initialData: any;

    getInitialData<T = any>(): T;
    getInitialData<T = any>(key: string): T;

    registerRoutingMap(routingMap: Array<{ spec: string, component: Page, title: string }>): this;

    registerSocketEvents(events: Array<string>): this;

    registerComponents(components: Array<{ elementId: string, component: BaseComponent }>): this;

    start(): void;
    start(connectSocket: boolean): void;

    refreshContent(): void;

    render(route: Route): void;
    render(route: Route, refresh: boolean): void;

    renderComponent(component: JSX.Element, target: HTMLElement): void;
    renderComponent(component: JSX.Element, target: HTMLElement, callback: () => void): void;

    redirect(path: string): void;
    redirect(path: string, q: { [key: string]: string }): void;

    navigate(path: string): void;
    navigate(path: string, q: { [key: string]: string }): void;
    navigate(path: string, q: { [key: string]: string }, refresh: boolean): void;

    pushState(path: string, q: { [key: string]: string }): void;

    setTitle(title: string): void;

    setRef<T = any>(ref: T, key: string): void;

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

declare class Socket {

    readonly STATE_NONE: 'none';

    readonly STATE_CONNECTING: 'connecting';

    readonly STATE_CONNECTED: 'connected';

    readonly STATE_DISCONNECTED: 'disconnected';

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

interface IButtonProps {
    href?: string;
    refreshContent?: boolean;
}

interface IErrorPageProps extends IPageProps {
    error: {
        message: string;
        code: string;
        stack?: string;
    };
}

interface ITextProps extends React.HTMLProps<Text> {
    dictionaryKey: string;
    tag?: string | Node;
    args?: Array<any>;
}

interface ILoaderProps {
    loaded: boolean;
    size?: 'large' | 'normal' | 'small' | 'xsmall';
    block?: boolean;
}

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

declare const App: Application;
declare const R: Router;
declare const S: Socket;
declare const ST: Storage;

export interface IPageProps {
    params: any;
    query: any;
    initialData: any;
}

/**
 * Simple class to handle callbacks.
 */
export class CallbackEmitter {

    public addListener(event: string, listener: (self: this) => void): this;
    /**
     * Registers the listener of the event.
     *
     * @param event Name of the event.
     * @param listener Listener to execute when the event is called.
     */
    public addListener(event: string, listener: (self: this, args: any) => void): this;

    public removeListener(event: string, listener: (self: this) => void): this;
    /**
     * Removes the listener of the event.
     *
     * @param event Name of the event.
     * @param listener 
     */
    public removeListener(event: string, listener: (self: this, args: any) => void): this;

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

    public getText(key: string): string;
    /**
     * Gets the text from the dictionary.
     *
     * @param key Key of the text in the dictionary.
     * @param args Arguments for text format.
     */
    public getText(key: string, ...args: Array<any>): string;

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

export class SocketComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {

    onSocketStateChanged(state: any): void;
    onSocketError(error: any): void;

    on<R = any>(event: string, callback: (error?: any, data?: R) => void): this;

    call<R = any>(event: string): Promise<R>;
    call<P = any, R = any>(event: string, data: P): Promise<R>;
    call<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
    call<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;

    requestAsync<R = any>(event: string): Promise<R>;
    requestAsync<P = any, R = any>(event: string, data: P): Promise<R>;
    requestAsync<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;
    requestAsync<P = any, R = any>(event: string, data: P, timeout: number, onProgress: (progress: number) => void): Promise<R>;

    request<R = any>(event: string, callback: (error?: any, data?: R) => void): this;
    request<P = any, R = any>(event: string, data: P, callback: (error?: any, data?: R) => void): this;
    request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void): this;
    request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void, onProgress: (progress: number) => void): this;

    emit(event: string): this;
    emit(event: string, key: string): this;
    emit<P = any>(event: string, key: string, data: P): this;
    emit<P = any>(event: string, key: string, data: P, onProgress: (progress: number) => void): this;
}

export class Page<P extends IPageProps = { params: any, query: any, initialData: any }, S = {}, SS = any> extends SocketComponent<P, S, SS> {
    onPageRender(): void;
}

export class DataComponent extends SocketComponent<IDataComponentProps> {

    load(): void;
}

/**
 * Component for navigation throught the application. The click event calls {Application.navigate} method.
 * @deprecated
 */
export class Button extends BaseComponent<IButtonProps & React.ButtonHTMLAttributes<Button>> { }

export class Text extends BaseComponent<ITextProps> {

    static addDictionary(dictionary: { [key: string]: string }): Text;
    static addDictionary(key: string, dictionary: { [key: string]: string }): Text;

    static setDictionary(key: string): Text;

    static addFunction(name: string, fn: (...args: any[]) => string): Text;

    static get(key: string, ...args: any[]): string;

    static format(text: string, ...args: any[]): string;
}

export class Loader extends BaseComponent<ILoaderProps> { }

export class ErrorPage extends Page<IErrorPageProps> {

    renderStack(): JSX.Element;
}

export default App;

export {
    App as Application,
    R as Router,
    S as Socket,
    ST as Storage,
}