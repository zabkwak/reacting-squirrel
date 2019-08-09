import * as http from 'http';
import * as net from 'net';
import * as express from 'express';
import { Component } from 'react';
import HttpSmartError from 'http-smart-error';
import { ServerOptions as SocketServerOptions } from 'socket.io';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Express request.
 *
 * @typeparam S Type of the Session
 */
export interface IRequest<S extends Session = Session> extends express.Request {
    session: S;
}

/**
 * Express response.
 */
export interface IResponse extends express.Response { }

/**
 * Server configuration.
 */
interface IAppConfig {
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
     * @default '[random generated string]'
     */
    cookieSecret?: string;
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
    /**
     * Function to handle errors in the route execution.
     * @default (err, req, res, next) => next()
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
}

interface ISocketEvent<S extends Session = Session> {
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
}

export interface ILayoutProps<T = {}, U = any> {
    title: string;
    initialData: ILayoutPropsInitialData<U> & T;
    /** @deprecated */
    user?: U;
    scripts?: Array<string>;
    styles?: Array<string>;
    version: string;
    bundle: string;
    charSet?: string;
    lang?: string;
}

export class Socket<S extends Session = Session> {

    static add(socket: net.Socket, events: Array<ISocketEvent>, maxMessageSize: number): void;

    static broadcast(event: string, data: any, filter: (socket: Socket) => boolean): void;

    static itereateSockets(iterator: (socket: Socket) => void): void;

    static on<S extends Session = Session>(event: 'connection' | 'error' | 'disconnect', listener: (socket: Socket<S>) => void): void;
    static on<S extends Session = Session>(event: 'connection' | 'error' | 'disconnect', listener: (socket: Socket<S>, ...args: Array<any>) => void): void;

    constructor(socket: net.Socket);

    emit(event: string, data: any): void;

    on(event: string, listener: (data?: any) => void): void;

    broadcast(event: string, data: any): void;
    broadcast(event: string, data: any, includeSelf: boolean): void;
    broadcast(event: string, data: any, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

    getSession(): S;
}

export class Session {

    static genereateId(): string;

    id: string;

    constructor(id: string);

    setUser(user: any): void;

    getUser(): any;
}

export class Layout<P = ILayoutProps> extends Component<P> {

    renderContainer(): JSX.Element;

    renderLoader(): JSX.Element;

    renderMeta(): JSX.Element;
}

export class SocketClass<S extends Session = Session> {

    getEvents(): Array<ISocketEvent<S>>;
    broadcast(event: string, data: any): void;
    broadcast(event: string, data: any, includeSelf: boolean): void;
    broadcast(event: string, data: any, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

    setSocket(socket: Socket): void;
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
    export function registerComponents(app: Server, components: Array<{ id: string, component: string }>): void;
}

/**
 * Base server application.
 */
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

    /**
     * Gets the instance of the server.
     */
    getServer(): http.Server;
    /**
     * Gets the instance of express application.
     */
    getApp(): express.Application;

    /**
     * Gets the list of registered socket events.
     */
    getSocketEvents(): Array<ISocketEvent>;

    /**
     * Gets the list of registered socket classes.
     */
    getSocketClasses(): Array<SocketClass>;

    /**
     * Authorizes the user.
     *
     * @param session Current session.
     * @param next Callback after the auth process.
     */
    auth(session: Session, next: (err?: any) => void): void;

    get(route: string, contentComponent: string, title: string): this;
    get(route: string, contentComponent: string, title: string, requireAuth: boolean): this;
    /**
     * Registers the GET route.
     * @param route
     * @param contentComponent 
     * @param title 
     * @param requireAuth 
     * @param callback 
     * @deprecated
     */
    get(route: string, contentComponent: string, title: string, requireAuth: boolean, callback: Function): this;

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
     * @param componentPath Relative path to the component from the app directory.
     * @param elementId Id of the element in the layout where the component should be rendered.
     */
    registerComponent(componentPath: string, elementId: string): this;

    /**
     * Starts the application.
     *
     * @param cb Callback called after the application is started.
     */
    start(cb?: (err?: any) => void): void;
}