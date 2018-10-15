import React from 'react';

import Server, { Layout } from '../../../server';
import User from './user.socket';

class CustomLayout extends Layout {

    renderContainer() {
        return (
            <div id="container">
                <div id="test" />
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
    dev: false,
    layoutComponent: CustomLayout,
    entryFile: 'entry.js',
});

app.get('/', 'home', 'Home');

app.get('/about', 'about.tsx', 'About');

app.registerSocketClass(User);

app.registerComponent('test', 'test');

app.start(() => console.log('App started'));
