#! /usr/bin/env node

import argsParser from 'args-parser';
import path from 'path';
import CliProgress from 'cli-progress';

import Server from '../server';

const { log, ...config } = argsParser(process.argv);

let bar;

if (config.rsConfig) {
	config.rsConfig = path.resolve(config.rsConfig);
}
if (!config.onWebpackProgress) {
	config.onWebpackProgress = (p) => {
		if (!bar) {
			bar = new CliProgress.SingleBar({ clearOnComplete: true }, CliProgress.Presets.shades_classic);
			bar.start(100);
		}
		bar.update(Math.round(p * 100));
		if (p === 1) {
			bar.stop();
		}
	};
}

const app = new Server({ ...config, dev: false });

if (config.r) {
	require(path.resolve(config.r))(app);
}

(async () => {
	try {
		await app.bundle();
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();
