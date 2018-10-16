declare module 'reacting-squirrel' {
    import { Component as BaseComponent } from 'react';
    import * as url from 'url';

    class Application extends CallbackEmitter {

        DEV: boolean;
        initialData: any;

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
    }

    class Route {

        static create(route: { spec: string, component: JSX.Element, title: string, initialData?: any }): Route;

        constructor(spec: string, component: JSX.Element, title: string);
        constructor(spec: string, component: JSX.Element, title: string, initialData: any);

        getComponent(): JSX.Element;
    }

    class Router {

        addRoute(route: Route): this;

        getRoute(): Route;

        pushState(): void;
        pushState(path: string): void;
        pushState(path: string, q: { [key: string]: string }): void;

        parseUrl(): url.Url;
        parseUrl(params: boolean): url.Url;

        getParams(): { [key: string]: string };
    }

    class Socket {

        readonly STATE_NONE: 'none';

        readonly STATE_CONNECTING: 'connecting';

        readonly STATE_CONNECTED: 'connected';

        readonly STATE_DISCONNECTED: 'disconnected';

        registerSocketEvents(events: Array<string>): void;

        connect(): void;
        connect(address: string): void;

        emit(event: string): this;
        emit<P = any>(event: string, data: P): this;

        disconnect(): void;

        getState(): string;

        isConnected(): boolean;
    }

    class Storage {

        size(): number;

        has(key: string): boolean;

        set(key: string, data: any): void;

        get(key: string): any;
        get<T>(key: string): T;

        delete(key: string): void;

        clear(): void;
    }

    interface IButtonProps {
        href: string;
        refreshContent?: boolean;
    }

    interface IErrorPageProps extends IPageProps {
        error: {
            message: string;
            code: string;
            stack?: string;
        };
    }

    interface ITextProps {
        dictionaryKey: string;
        tag: string | Node;
        args: Array<any>;
    }

    interface ILoaderProps {
        loaded: boolean;
        size?: 'normal' | 'small' | 'xsmall';
        block?: boolean;
    };

    const App: Application;
    const R: Router;
    const S: Socket;
    const ST: Storage;

    export interface IPageProps {
        params: any;
        query: any;
        initialData: any;
    }

    export class CallbackEmitter {

        addListener(event: string, listener: (self: this) => void): this;
        addListener(event: string, listener: (self: this, args?: any) => void): this;

        removeListener(event: string, listener: (self: this) => void): this;
        removeListener(event: string, listener: (self: this, args?: any) => void): this;
    }

    export class Component<P = {}, S = {}, SS = any> extends BaseComponent<P, S, SS> {

        componentDidMount(): void;

        componentWillUnmount(): void;

        getContext(): Application;

        getText(key: string): string;
        getText(key: string, ...args: []): string;

        onPopState(event: any): void;
    }

    export class SocketComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {

        onSocketStateChanged(state: any): void;

        on<R = any>(event: string, callback: (error?: any, data?: R) => void): this;

        request<R = any>(event: string, callback: (error?: any, data?: R) => void): this;
        request<P = any, R = any>(event: string, data: P, callback: (error?: any, data?: R) => void): this;
        request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void): this;

        emit(event: string): this;
        emit<P = any>(event: string, data: P): this;
    }

    export class Page<P extends IPageProps = { params: any, query: any, initialData: any }, S = {}, SS = any> extends SocketComponent<P, S, SS> { }

    export class Button extends BaseComponent<IButtonProps> { }

    export class Text extends BaseComponent<ITextProps> {

        static addDictionary(dictionary: { [key: string]: string }): Text;
        static addDictionary(key: string, dictionary: { [key: string]: string }): Text;

        static setDictionary(key: string): Text;

        static addFunction(name: string, fn: (...args: any[]) => string): Text;

        static get(key: string, ...args: any[]): string;

        static format(text: string, ...args: any[]): string;
    }

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

}

declare module 'reacting-squirrel/server' {

    import * as http from 'http';
    import * as net from 'net';
    import * as express from 'express';
    import { Component } from 'react';
    import HttpSmartError from 'http-smart-error';

    interface IAppConfig {
        port?: number;
        staticDir?: string;
        dev?: boolean;
        jsDir?: string;
        filename?: string;
        appDir?: string;
        entryFile?: string;
        layoutComponent?: typeof Layout;
        cookieSecret?: string;
        scripts?: Array<string>;
        styles?: Array<string>;
        session?: typeof Session;
        auth?: (session: Session, next: (err?: any) => void) => void;
        errorHandler?: (err: any, req: express.Request, res: express.Response, next: (err?: any) => void) => void;
        bundlePathRelative?: boolean;
        webpack?: any;
    }

    interface ISocketEvent {
        event: string;
        listener: (data: any, next?: (err?: any, data?: any) => void) => void | Promise<any>;
    }

    interface ILayoutProps {
        title: string;
        initialData: any;
        user?: any;
        scripts?: Array<string>;
        styles?: Array<string>;
        version: string;
        bundle: string;
        charSet?: string;
        lang?: string;
    }

    class Socket {

        static add(socket: net.Socket, events: Array<ISocketEvent>, classes: Array<SocketClass>): void;

        static itereateSockets(iterator: (socket: Socket) => void): void;

        constructor(socket: net.Socket);

        emit(event: string, data: any): void;

        on(event: string, listener: (data?: any) => void): void;

        broadcast(event: string, data: any): void;
        broadcast(event: string, data: any, includeSelf: boolean): void;
        broadcast(event: string, data: any, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

    }

    export class Session {

        static genereateId(): string;

        id: string;

        constructor(id: string);

        setUser(user: any): void;

        getUser(): any;
    }

    export class Layout extends Component<ILayoutProps> {

        renderContainer(): JSX.Element;

        renderLoader(): JSX.Element;
    }

    export class SocketClass {

        getEvents(): Array<ISocketEvent>;
        broadcast(event: string, data: any): void;
        broadcast(event: string, data: any, includeSelf: boolean): void;
        broadcast(event: string, data: any, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

        setSocket(socket: Socket): void;

        getSession(): Session;

        getUser(): any;
    }

    export { HttpSmartError as HttpError };

    export default class Server {

        port: number;
        staticDir: string;
        staticDirAbsolute: string;
        dev: boolean;
        path: string;
        bundlePath: string;
        bundlePathAbsolute: string;
        appDir: string;
        appDirAbsolute: string;
        Layout: JSX.Element;
        Session: typeof Session;

        constructor(config?: IAppConfig);

        getServer(): http.Server;

        getSocketEvents(): Array<ISocketEvent>;

        getSocketClasses(): Array<SocketClass>;

        auth(session: Session, next: (err?: any) => void): void;

        get(route: string, contentComponent: string, title: string): this;
        get(route: string, contentComponent: string, title: string, requireAuth: boolean): this;
        get(route: string, contentComponent: string, title: string, requireAuth: boolean, callback: Function): this;

        registerRoute(method: 'get' | 'post' | 'put' | 'delete', route: string, contentComponent: string, title: string): this;
        registerRoute(method: 'get' | 'post' | 'put' | 'delete', route: string, contentComponent: string, title: string, requireAuth: boolean): this;
        registerRoute(method: 'get' | 'post' | 'put' | 'delete', route: string, contentComponent: string, title: string, requireAuth: boolean, callback: Function): this;

        registerSocketClass(cls: typeof SocketClass): this;

        registerSocketEvent(event: string, listener: ISocketEvent['listener']): this;

        registerComponent(componentPath: string, elementId: string): this;

        start(cb?: (err?: any) => void): void;
    }
}