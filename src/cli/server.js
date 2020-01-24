#! /usr/bin/env node

import argsParser from 'args-parser';
import path from 'path';

import Server from '../server';

const { log, ...config } = argsParser(process.argv);

if (config.rsConfig) {
	config.rsConfig = path.resolve(config.rsConfig);
}

const app = new Server(config);

app.start((err) => {
	if (err) {
		// eslint-disable-next-line no-console
		console.error(err);
		process.exit(1);
	}
	if (log) {
		// eslint-disable-next-line no-console
		console.log(new Date(), 'App started.');
	}
});
