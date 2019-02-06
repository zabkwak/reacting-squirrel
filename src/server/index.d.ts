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

    export class Socket {

        static add(socket: net.Socket, events: Array<ISocketEvent>, classes: Array<SocketClass>): void;

        static broadcast(event: string, data: any, filter: (socket: Socket) => boolean): void;

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

    export class SocketClass<S extends Session = Session> {

        getEvents(): Array<ISocketEvent>;
        broadcast(event: string, data: any): void;
        broadcast(event: string, data: any, includeSelf: boolean): void;
        broadcast(event: string, data: any, includeSelf: boolean, filter: (socket: Socket) => boolean): void;

        setSocket(socket: Socket): void;

        getSession(): S;

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

        registerSocketClass(cls: new () => SocketClass<Session>): this;

        registerSocketEvent(event: string, listener: ISocketEvent['listener']): this;

        registerComponent(componentPath: string, elementId: string): this;

        start(cb?: (err?: any) => void): void;
    }
}