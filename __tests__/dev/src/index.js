import React from 'react';

import Server, { Layout } from '../../../server';
import User from './user.socket';

class CustomLayout extends Layout {

    renderContainer() {
        return (
            <div id="container">
                <div id="test" />
                <div id="content" />
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
});

app.get('/', 'home', 'Home');

app.registerSocketClass(User);

app.registerComponent('test', 'test');

app.start();
