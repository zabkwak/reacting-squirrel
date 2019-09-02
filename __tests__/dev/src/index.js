import React from 'react';
import '@babel/polyfill';
import fs from 'fs';
import path from 'path';

import Server, { Layout, Socket, Utils } from '../../../server';

class CustomLayout extends Layout {

	renderContainer() {
		return (
			<div id="container">
				<div id="test" />
				<div id="socket-status" />
				<div id="content">
					{this.renderLoader()}
				</div>
			</div>
		);
	}
}

const app = new Server({
	appDir: './__tests__/app',
	staticDir: './__tests__/public',
	moduleDev: true,
	dev: true,
	layoutComponent: CustomLayout,
	entryFile: 'entry.js',
	styles: ['/css/main.css'],
	scripts: ['/js/script.js?api_key=API_KEY'],
	mergeStyles: [
		path.resolve('./node_modules/bootstrap/dist/css/bootstrap.css'),
	],
	rsConfig: path.resolve(__dirname, '../rsconfig.json'),
	// cookieSecret: 'dev-secret',
    /*
    onWebpackProgress: (percents, message) => {
        console.log(`${percents * 100}%`, message);
    },
    */
	// socketMessageMaxSize: 1,
});

app.get('/error', null, 'Error', false, (req, res, next) => {
	next({ message: 'Test error', date: new Date(), statusCode: 501 });
});

app.registerSocketEvent('socket.test', async (socket, data) => data);
app.registerSocketEvent('socket.file', async (socket, { file, name }) => {
	fs.writeFileSync(`./tmp/${name}`, file);
});

app.start((err) => {
	if (err) {
		console.error(err);
		return;
	}
	console.log('App started');
});

Socket.on('connection', socket => console.log('SOCKET CONNECTED'));
