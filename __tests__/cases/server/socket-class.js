import { expect } from 'chai';

import SocketClass from '../../../src/server/socket-class';

describe('SocketClass', () => {

    class CustomSocket extends SocketClass {

        load(data, next) {
            next(null, data);
        }
    }

    it('checks if the correct events are returned from the getEvents method', () => {
        const s = new CustomSocket();
        const events = s.getEvents();
        expect(events).to.be.an.instanceOf(Array);
        expect(events.length).to.be.equal(1);
        const [event] = events;
        expect(event).to.have.all.keys(['event', 'listener']);
        expect(event.event).to.be.equal('customsocket.load');
        expect(event.listener).to.be.an('function');
    });

    it('checks if the listener is correctly called', (done) => {
        const s = new CustomSocket();
        const events = s.getEvents();
        const [event] = events;
        event.listener('data', (err, data) => {
            expect(err).to.be.equal(null);
            expect(data).to.be.equal('data');
            done();
        });
    });
});
