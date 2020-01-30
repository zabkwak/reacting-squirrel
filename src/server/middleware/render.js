import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => {
	const { layoutComponent, cssDir } = server.getConfig();
	res.renderLayout = ({
		scripts, styles, data, title, layout,
	}) => {
		const LayoutComponent = layout || layoutComponent;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(`<!DOCTYPE html>${ReactDOMServer.renderToString(<LayoutComponent
			scripts={[...server.getConfig('scripts'), ...(scripts || [])]}
			styles={[
				...server.getConfig('styles'),
				...(styles || []),
				`/${cssDir}/rs-app.css`,
			]}
			initialData={data || {}}
			title={title.indexOf(':') === 0 ? server.getLocaleText(req.locale, title.substr(1)) : title}
			user={req.user}
			version={server.version}
			bundle={server.bundlePath}
			url={{
				protocol: req.protocol,
				hostname: req.get('host'),
				pathname: req.originalUrl,
			}}
			getText={(key, ...args) => server.getLocaleText(req.locale, key, ...args)}
			nonce={server.nonce}
		/>)}`);
	};
	res.render = (data) => {
		server.logWarning('RS', 'res.render is deprecated and will be removed in future major release.');
		res.renderLayout(data);
	};
	next();
};
