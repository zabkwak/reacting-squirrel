import { expect } from 'chai';

import { Socket } from '../../../src/app';

const URL = 'http://localhost:8080';

Socket.registerEvents(['test']);

describe('Socket connection', () => {

    it('connects to the socket', (done) => {
        expect(Socket.getState()).to.be.equal('none');
        Socket.connect(URL);
        expect(Socket.getState()).to.be.equal('connecting');
        const listener = (socket, state) => {
            expect(Socket.getState()).to.be.equal('connected');
            expect(Socket.isConnected()).to.be.equal(true);
            Socket.removeListener('state', listener);
            done();
        };
        Socket.addListener('state', listener);
    });

    it('handshakes the socket', (done) => {
        Socket.addListener('handshake', (socket, data) => {
            expect(data).to.be.equal(null);
            done();
        });
        Socket.emit('handshake');
	});
	
	it('calls the test event', (done) => {
		Socket.addListener('test', (socket, data) => {
			expect(data).to.have.all.keys('data', '_key');
			expect(data.data).to.be.equal('test');
			done();
		})
		Socket.emit('test');
	});

    it('disconnects the socket', (done) => {
        Socket.addListener('state', (socket, state) => {
            expect(state).to.be.equal('disconnected');
            expect(Socket.isConnected()).to.be.equal(false);
            done();
        });
        Socket.disconnect();
    });
});
