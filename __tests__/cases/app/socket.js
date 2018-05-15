import { expect } from 'chai';

import Socket from '../../../src/app/socket';

const URL = 'http://localhost:8080';

describe('Socket connection', () => {

    it('connects to the socket', (done) => {
        expect(Socket.getState()).to.be.equal('none');
        Socket.connect(URL);
        expect(Socket.getState()).to.be.equal('connecting');
        const listener = (socket, state) => {
            expect(Socket.getState()).to.be.equal('connected');
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

    it('disconnects the socket', (done) => {
        Socket.addListener('state', (socket, state) => {
            expect(state).to.be.equal('disconnected');
            done();
        });
        Socket.disconnect();
    });
});
