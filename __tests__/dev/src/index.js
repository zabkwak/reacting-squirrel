import React from 'react';
import '@babel/polyfill';

import Server, { Layout, Socket } from '../../../server';
import User from './user.socket';

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
    // cookieSecret: 'dev-secret',
    /*
    onWebpackProgress: (percents, message) => {
        console.log(`${percents * 100}%`, message);
    },
    */
});

app.get('/', 'home', 'Home');

app.get('/about', 'about', 'About');

app.get('/error', null, 'Error', false, (req, res, next) => {
    next({ statusCode: 501, message: 'Test error', date: new Date() });
});

app.registerSocketClass(User);

app.registerComponent('test', 'test');
app.registerComponent('socket-status', 'socket-status');

app.start((err) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('App started');
});

Socket.on('connection', socket => console.log('SOCKET CONNECTED'));
