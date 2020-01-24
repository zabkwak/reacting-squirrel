export default class Plugin {

	register(server) {
		this.getEntryInjections().forEach((injection) => server.injectToEntry(injection));
		this.getSocketClasses().forEach((cls) => server.registerSocketClass(cls));
		this.getSocketEvents().forEach(({ event, listener }) => server.registerSocketEvent(event, listener));
		this.getRouteCallbacks().forEach(({ route, callback }) => server.registerRouteCallback(route, callback));
		this.getBeforeExecutions().forEach(({ spec, callback }) => server.registerBeforeExecution(spec, callback));
		this.getMiddlewares().forEach(({ afterRoutes, callback }) => server.registerMiddleware(callback, afterRoutes));
		this.getScripts().forEach((script) => server.getConfig().scripts.push(script));
		this.getStyles().forEach((style) => server.getConfig().styles.push(style));
		this.getMergeStyles().forEach((style) => server.getConfig().mergeStyles.push(style));
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

	// TODO register routes -> pages on client side
	// TODO register components -> components on client side

	// TODO plugins in rsconfig
}
