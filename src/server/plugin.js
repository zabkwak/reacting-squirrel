export default class Plugin {

	/**
	 *
	 * @param {import('./').default} server
	 */
	async register(server) {
		this.getEntryInjections().forEach((injection) => server.injectToEntry(injection));
		this.getSocketClasses().forEach((cls) => server.registerSocketClass(cls));
		this.getSocketEvents().forEach(({ event, listener }) => server.registerSocketEvent(event, listener));
		this.getRouteCallbacks()
			.forEach(({ route, callback, method }) => server.registerRouteCallback(method, route, callback));
		this.getBeforeExecutions().forEach(({ spec, callback }) => server.registerBeforeExecution(spec, callback));
		this.getMiddlewares().forEach(({ afterRoutes, callback }) => server.registerMiddleware(callback, afterRoutes));
		this.getPages().forEach(({
			method, route, component, title, requireAuth, layout,
		}) => server.registerRoute(method || 'get', route, component, title, requireAuth, layout, undefined));
		this.getComponents().forEach(({ id, component }) => server.registerComponent(component, id));
		this.getScripts().forEach((script) => server.getConfig().scripts.push(script));
		this.getStyles().forEach((style) => server.getConfig().styles.push(style));
		this.getMergeStyles().forEach((style) => server.getConfig().mergeStyles.push(style));
		if (this.getComponentProvider()) {
			server.registerComponentProvider(this.getComponentProvider());
		}
	}

	getEntryInjections() {
		return [];
	}

	getSocketEvents() {
		return [];
	}

	getSocketClasses() {
		return [];
	}

	getRouteCallbacks() {
		return [];
	}

	getBeforeExecutions() {
		return [];
	}

	getScripts() {
		return [];
	}

	getStyles() {
		return [];
	}

	getMergeStyles() {
		return [];
	}

	getMiddlewares() {
		return [];
	}

	getPages() {
		return [];
	}

	getComponents() {
		return [];
	}

	getComponentProvider() {
		return null;
	}
}
