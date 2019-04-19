declare module 'reacting-squirrel' {
    import { Component as BaseComponent, ButtonHTMLAttributes } from 'react';
    import * as url from 'url';

    class Application extends CallbackEmitter {

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

        private static _stateStorage: { [key: string]: any };

        protected _mounted: boolean;

        public componentDidMount(): void;

        public componentWillUnmount(): void;

        public getContext(): Application;

        public getText(key: string): string;
        public getText(key: string, ...args: Array<any>): string;

        protected onPopState(event: any): void;

        protected saveState(key: string): void;

        protected loadState(key: string): Promise<void>;

        protected getStateKey(): string;
    }

    export class SocketComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {

        onSocketStateChanged(state: any): void;
        onSocketError(error: any): void;

        on<R = any>(event: string, callback: (error?: any, data?: R) => void): this;

        call<R = any>(event: string): Promise<R>;
        call<P = any, R = any>(event: string, data: P): Promise<R>;
        call<P = any, R = any>(event: string, data: P, timeout: number): Promise<R>;

        request<R = any>(event: string, callback: (error?: any, data?: R) => void): this;
        request<P = any, R = any>(event: string, data: P, callback: (error?: any, data?: R) => void): this;
        request<P = any, R = any>(event: string, data: P, timeout: number, callback: (error?: any, data?: R) => void): this;

        emit(event: string): this;
        emit<P = any>(event: string, data: P): this;
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

}