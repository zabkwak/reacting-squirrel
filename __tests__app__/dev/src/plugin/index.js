import path from 'path';

import { Plugin } from '../../../../server';

export default class ImportedPlugin extends Plugin {

	getName() {
		return 'Imported plugin';
	}

	getPages() {
		return [{
			route: '/plugin-page',
			title: 'Imported plugin page',
			component: path.resolve(__dirname, './page'),
		}];
	}

	getComponents() {
		return [{
			id: 'plugin-component',
			component: path.resolve(__dirname, './component'),
		}];
	}

	getComponentProvider() {
		return path.resolve(__dirname, './provider');
	}
}
