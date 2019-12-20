import '@babel/polyfill';

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!doctype html><html><head><title>Test</title></head><body><div id="container"><div id="content"></div></div></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
	Object.defineProperties(target, {
		...Object.getOwnPropertyDescriptors(src),
		...Object.getOwnPropertyDescriptors(target),
	});
}

global.location = {
	href: 'http://localhost:8080/test?baf=lek',
	reload: () => { },
};
global.window = window;
global.document = window.document;
global.navigator = {
	userAgent: 'node.js',
};
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => {
	clearTimeout(id);
};
copyProps(window, global);
