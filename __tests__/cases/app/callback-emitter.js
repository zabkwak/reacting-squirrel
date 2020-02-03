import { expect } from 'chai';

import CallbackEmitter from '../../../src/app/callback-emitter';

describe('CallbackEmitter', () => {

	describe('Handling listeners', () => {

		const EVENT = 'test';
		const emitter = new CallbackEmitter();
		const l1 = () => { };
		const l2 = () => { };

		it('adds the listener on the event', () => {
			emitter.addListener(EVENT, l1);
			expect(emitter._hasEventRegistered(EVENT)).to.be.true;
			expect(emitter._listeners).to.have.all.keys([EVENT]);
			expect(emitter._listeners[EVENT]).to.be.an.instanceOf(Array);
			expect(emitter._listeners[EVENT].length).to.be.equal(1);
		});

		it('adds second listener on the event', () => {
			emitter.addListener(EVENT, l2);
			expect(emitter._hasEventRegistered(EVENT)).to.be.true;
			expect(emitter._listeners).to.have.all.keys([EVENT]);
			expect(emitter._listeners[EVENT]).to.be.an.instanceOf(Array);
			expect(emitter._listeners[EVENT].length).to.be.equal(2);
		});

		it('adds same listener on the event', () => {
			emitter.addListener(EVENT, l2);
			expect(emitter._hasEventRegistered(EVENT)).to.be.true;
			expect(emitter._listeners).to.have.all.keys([EVENT]);
			expect(emitter._listeners[EVENT]).to.be.an.instanceOf(Array);
			expect(emitter._listeners[EVENT].length).to.be.equal(2);
		});

		it('removes the listener', () => {
			emitter.removeListener(EVENT, l2);
			expect(emitter._hasEventRegistered(EVENT)).to.be.true;
			expect(emitter._listeners).to.have.all.keys([EVENT]);
			expect(emitter._listeners[EVENT]).to.be.an.instanceOf(Array);
			expect(emitter._listeners[EVENT].length).to.be.equal(1);
		});

		it('clears listeners of an event', () => {
			emitter.clear(EVENT);
			expect(emitter._hasEventRegistered(EVENT)).to.be.false;
		});
	});

	describe('Calling listeners', () => {

		it('calls the listener', (done) => {
			const emitter = new CallbackEmitter();
			emitter.addListener('test', (e, data) => {
				expect(e).to.be.an.instanceOf(CallbackEmitter);
				expect(e).to.be.equal(emitter);
				expect(data).to.deep.equal({ test: 'test' });
				done();
			});
			emitter._callListener('test', { test: 'test' });
		});
	});
});