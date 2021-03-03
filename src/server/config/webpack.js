import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import ExtraWatchWebpackPlugin from 'extra-watch-webpack-plugin';
import readline from 'readline';

import { BABEL_TRANSPILE_MODULES } from '../constants';

const getStylesToWatch = (sourceStylesDir) => {
	const files = fs.readdirSync(sourceStylesDir);
	return files
		.map((f) => `${sourceStylesDir}/${f}`)
		.filter((f) => {
			const stat = fs.statSync(f);
			if (stat.isDirectory()) {
				// TODO nested
				return false;
			}
			if (f.indexOf('rs-') >= 0) {
				return false;
			}
			return ['.css', '.scss'].includes(path.extname(f));
		});
};

const webpackProgress = (percentage, message) => {
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(`Webpack: ${(percentage * 100).toFixed(2)}% ${message}`);
	readline.clearLine(process.stdout, 1);
	if (percentage === 1) {
		process.stdout.write('\n');
	}
};

/**
 * @param {import('../').default} server
 */
export default (server) => {
	const {
		dev, filename, staticDir, cssDir, babelTranspileModules, sourceStylesDir, onWebpackProgress,
	} = server.getConfig();
	const { plugins, ...config } = server.getConfig().webpack;
	const postCSSLoader = {
		loader: 'postcss-loader',
		options: {
			config: {
				// eslint-disable-next-line no-underscore-dangle
				path: `${server._getRSDirPath()}/postcss.config.js`,
			},
		},
	};
	const prodStyleLoader = {
		loader: 'prod-style-loader',
		options: {
			outDir: path.resolve(`${staticDir}/${cssDir}`),
		},
	};
	const wp = webpack({
		mode: dev ? 'development' : 'production',
		// eslint-disable-next-line no-underscore-dangle
		entry: ['@babel/polyfill', `${server._getRSDirPath()}/entry.js`],
		output: {
			// eslint-disable-next-line no-underscore-dangle
			path: server._path,
			filename,
		},
		resolve: {
			extensions: ['.js', '.jsx', '.ts', '.tsx'],
		},
		resolveLoader: {
			alias: {
				'prod-style-loader': path.resolve(__dirname, '../style-loader'),
			},
		},
		module: {
			rules: [
				{
					test: /\.js?$/,
					exclude: /node_modules/,
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
						plugins: [
							'@babel/plugin-transform-async-to-generator',
							['@babel/plugin-proposal-decorators', { legacy: true }],
						],
					},
				},
				// eslint-disable-next-line arrow-body-style
				...([...BABEL_TRANSPILE_MODULES, ...babelTranspileModules].map((m) => {
					return {
						test: /\.js$/,
						include: [
							new RegExp(`node_modules\\${path.sep}${m}`),
						],
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					};
				})),
				{
					test: /\.ts$|\.tsx$/,
					// exclude: /node_modules/,
					loader: 'ts-loader',
					options: {
						configFile: '~rs/tsconfig.json',
					},
				},
				{
					test: /\.css?$/,
					use: dev ? [
						{
							loader: 'style-loader',
							options: {
								attributes: {
									nonce: server.nonce,
								},
							},
						},
						'css-loader',
						postCSSLoader,
					] : prodStyleLoader,
				},
				{
					test: /\.scss?$/,
					use: dev ? [
						{
							loader: 'style-loader',
							options: {
								attributes: {
									nonce: server.nonce,
								},
							},
						},
						'css-loader',
						postCSSLoader,
						'sass-loader',
					] : prodStyleLoader,
				},
			],
		},
		target: 'web',
		devtool: dev ? 'source-map' : undefined,
		plugins: [
			new ExtraWatchWebpackPlugin({
				files: getStylesToWatch(sourceStylesDir),
			}),
		].concat(plugins || []),
		...config,
	});

	let webpackDone = false;
	const p = new webpack.ProgressPlugin((percentage, message, ...args) => {
		if (!webpackDone) {
			if (typeof onWebpackProgress === 'function') {
				onWebpackProgress(percentage, message);
			} else if (dev) {
				webpackProgress(percentage, message);
			}
			if (percentage === 1) {
				webpackDone = true;
			}
			server.updateBundlingStatus(percentage * 100);
		}
	});
	p.apply(wp);

	return wp;
};
