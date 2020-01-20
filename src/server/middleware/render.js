import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * @param {import('../').default} server
 */
export default (server) => (req, res, next) => {
	const { layoutComponent, cssDir } = server.getConfig();
	res.render = ({
		scripts, styles, data, title, layout,
	}) => {
		const LayoutComponent = layout || layoutComponent;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(`<!DOCTYPE html>${ReactDOMServer.renderToString(<LayoutComponent
			scripts={server.getConfig().scripts.concat(scripts || [])}
			styles={server.getConfig().styles.concat(styles || [`/${cssDir}/rs-app.css`])}
			initialData={data || {}}
			// eslint-disable-next-line no-underscore-dangle
			title={title.indexOf(':') === 0 ? server._getLocaleText(req.locale, title.substr(1)) : title}
			user={req.user}
			// eslint-disable-next-line no-underscore-dangle
			version={server._version}
			// eslint-disable-next-line no-underscore-dangle
			bundle={server._bundlePath}
			url={{
				protocol: req.protocol,
				hostname: req.get('host'),
				pathname: req.originalUrl,
			}}
			// eslint-disable-next-line no-underscore-dangle
			getText={(key, ...args) => server._getLocaleText(req.locale, key, ...args)}
		/>)}`);
	};
	server.auth(req.session, next);
};
