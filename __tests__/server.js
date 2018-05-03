import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import request from 'request';

import Server from '../src/server';
import Session from '../src/server/session';
import Layout from '../src/server/layout';

const PROJECT_PATH = path.resolve(__dirname, '../');

describe('Server instance', () => {

    it('checks default config fields of the server', () => {
        const server = new Server();
        expect(server._config).to.have.all.keys(['port', 'staticDir', 'dev', 'jsDir', 'filename', 'appDir', 'layoutComponent', 'cookieSecret', 'scripts', 'styles', 'session', 'auth', 'webpack']);
        const {
            port, staticDir, dev, jsDir, filename, appDir, layoutComponent, cookieSecret, scripts, styles, session, auth, webpack,
        } = server._config;
        expect(port).to.be.equal(8080);
        expect(staticDir).to.be.equal('./public');
        expect(dev).to.be.equal(false);
        expect(jsDir).to.be.equal('js');
        expect(filename).to.be.equal('bundle.js');
        expect(appDir).to.be.equal('./app');
        expect(layoutComponent).to.be.an('function');
        expect(new layoutComponent()).to.be.an.instanceOf(Layout);
        expect(cookieSecret).to.be.an('string');
        expect(scripts).to.be.an.instanceOf(Array);
        expect(scripts.length).to.be.equal(0);
        expect(styles).to.be.an.instanceOf(Array);
        expect(styles.length).to.be.equal(0);
        expect(session).to.be.an('function');
        expect(new session()).to.be.an.instanceOf(Session);
        expect(auth).to.be.an('function');
        expect(webpack).to.be.an('object');

        expect(server.port).to.be.equal(port);
        expect(server.staticDir).to.be.equal(staticDir);
        expect(server.staticDirAbsolute).to.be.equal(path.resolve(PROJECT_PATH, staticDir));
        expect(server.dev).to.be.equal(dev);
        expect(server.bundlePath).to.be.equal(`/${jsDir}/${filename}`);
        expect(server.bundlePathAbsolute).to.be.equal(path.resolve(PROJECT_PATH, staticDir, jsDir, filename));
        expect(server.appDir).to.be.equal(appDir);
        expect(server.appDirAbsolute).to.be.equal(path.resolve(PROJECT_PATH, appDir));
        expect(server.path).to.be.equal(path.resolve(PROJECT_PATH, `${staticDir}/${jsDir}`));
        expect(new server.Layout()).to.be.an.instanceOf(Layout);
        expect(new server.Session()).to.be.an.instanceOf(Session);
    });

    it('checks the set config fields of the server', () => {
        const server = new Server({
            port: 9000,
            staticDir: './__static__',
            dev: true,
            jsDir: '__js__',
            filename: '__bundle__.js',
            appDir: './__app__',
            layoutComponent: Layout,
            cookieSecret: 'cookie-secret',
            scripts: ['some-script.js'],
            styles: ['some-style.css'],
            session: Session,
            auth: (session, next) => next(),
            webpack: {},
        });
        expect(server._config).to.have.all.keys(['port', 'staticDir', 'dev', 'jsDir', 'filename', 'appDir', 'layoutComponent', 'cookieSecret', 'scripts', 'styles', 'session', 'auth', 'webpack']);
        const {
            port, staticDir, dev, jsDir, filename, appDir, layoutComponent, cookieSecret, scripts, styles, session, auth, webpack,
        } = server._config;
        expect(port).to.be.equal(9000);
        expect(staticDir).to.be.equal('./__static__');
        expect(dev).to.be.equal(true);
        expect(jsDir).to.be.equal('__js__');
        expect(filename).to.be.equal('__bundle__.js');
        expect(appDir).to.be.equal('./__app__');
        expect(layoutComponent).to.be.an('function');
        expect(new layoutComponent()).to.be.an.instanceOf(Layout);
        expect(cookieSecret).to.be.an('string');
        expect(scripts).to.be.an.instanceOf(Array);
        expect(scripts.length).to.be.equal(1);
        expect(scripts[0]).to.be.equal('some-script.js');
        expect(styles).to.be.an.instanceOf(Array);
        expect(styles.length).to.be.equal(1);
        expect(styles[0]).to.be.equal('some-style.css');
        expect(session).to.be.an('function');
        expect(new session()).to.be.an.instanceOf(Session);
        expect(auth).to.be.an('function');
        expect(webpack).to.be.an('object');

        expect(server.port).to.be.equal(port);
        expect(server.staticDir).to.be.equal(staticDir);
        expect(server.staticDirAbsolute).to.be.equal(path.resolve(PROJECT_PATH, staticDir));
        expect(server.dev).to.be.equal(dev);
        expect(server.bundlePath).to.be.equal(`/${jsDir}/${filename}`);
        expect(server.bundlePathAbsolute).to.be.equal(path.resolve(PROJECT_PATH, staticDir, jsDir, filename));
        expect(server.appDir).to.be.equal(appDir);
        expect(server.appDirAbsolute).to.be.equal(path.resolve(PROJECT_PATH, appDir));
        expect(server.path).to.be.equal(path.resolve(PROJECT_PATH, `${staticDir}/${jsDir}`));
        expect(new server.Layout()).to.be.an.instanceOf(Layout);
        expect(new server.Session()).to.be.an.instanceOf(Session);
    });

    it('tries to set not Layout child as a layoutComponent', () => {
        expect(() => new Server({ layoutComponent: class { } })).to.throw(Error, 'Cannot create instance of Layout.');
    });

    it('tries to set not Session child as a session', () => {
        expect(() => new Server({ session: class { } })).to.throw(Error, 'Cannot create instance of Session.');
    });

    it('checks if the auth method is called', (done) => {
        const server = new Server({ auth: (session, next) => done() });
        server.auth();
    });
});

describe('Start of the server', () => {

    it('starts the server', (done) => {
        const URL = 'http://localhost:8080';
        const server = new Server({ appDir: './test' });
        const RS_DIR = server._getRSDirPathAbsolute();

        server.get('/', 'home', 'Home');

        server.start(() => {
            expect(fs.existsSync(server.staticDirAbsolute)).to.be.equal(true);
            expect(fs.existsSync(server.bundlePathAbsolute)).to.be.equal(true);
            expect(fs.existsSync(RS_DIR)).to.be.equal(true);
            expect(fs.existsSync(path.normalize(`${RS_DIR}/entry.js`))).to.be.equal(true);
            expect(fs.existsSync(path.normalize(`${RS_DIR}/router.map.js`))).to.be.equal(true);
            expect(fs.existsSync(path.normalize(`${RS_DIR}/socket.map.js`))).to.be.equal(true);
            expect(fs.existsSync(path.normalize(`${RS_DIR}/postcss.config.js`))).to.be.equal(true);

            request.get(URL, (err, res, body) => {
                expect(err).to.be.equal(null);
                expect(res.statusCode).to.be.equal(200);

                request.get(`${URL}/js/bundle.js`, (err, res, body) => {
                    expect(err).to.be.equal(null);
                    expect(res.statusCode).to.be.equal(200);
                    done();
                });
            });
        });
    });
});
