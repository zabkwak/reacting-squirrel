import Server from '../../../server';

const app = new Server({
    appDir: './__tests__/app',
    staticDir: './__tests__/public',
    moduleDev: true,
    dev: true,
});

app.get('/', 'home', 'Home');

app.start();
