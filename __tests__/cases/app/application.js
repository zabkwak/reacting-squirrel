import { expect } from 'chai';

import '../../globals';

import { Application } from '../../../src/app';

describe('Application', () => {

	it('checks if the application instance is correctly created', () => {
		expect(Application.DEV).to.be.equal(false);
		expect(Application._container).to.be.equal(null);
		expect(Application._content).to.be.equal(null);
		expect(Application._title).to.be.equal(null);
		expect(Application._initialData).to.be.an('object');
		expect(JSON.stringify(Application._initialData)).to.be.equal('{}');
		expect(Application._started).to.be.equal(false);
		expect(Application._components).to.be.an.instanceOf(Array);
		expect(Application._components.length).to.be.equal(0);
	});

	it('starts the application', () => {
		Application.start(false);
		expect(Application._started).to.be.equal(true);
	});

	it('tries to call application methods which should be called before start after the start', () => {
		expect(Application.registerRoutingMap.bind(Application)).to.throw(Error).that.has.property('message', 'Application already started');
		expect(Application.registerComponents.bind(Application)).to.throw(Error).that.has.property('message', 'Application already started');
		expect(Application.start.bind(Application)).to.throw(Error).that.has.property('message', 'Application already started');
	});
});
