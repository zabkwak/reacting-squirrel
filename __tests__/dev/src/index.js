import React from 'react';
import 'babel-polyfill';

import Server, { Layout } from '../../../server';
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
    // cookieSecret: 'dev-secret',
});

app.get('/', 'home', 'Home');

app.get('/about', 'about', 'About');

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
