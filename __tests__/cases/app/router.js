import { expect } from 'chai';

import Router, { Route } from '../../../src/app/router';

describe('Router', () => {

    it('checks the attributes', () => {
        // console.log(Router._routes);
    });

    it('parses the url', () => {
        const parsed = Router.parseUrl();
        expect(parsed).to.have.all.keys(['protocol', 'slashes', 'auth', 'host', 'port', 'hostname', 'hash', 'search', 'query', 'pathname', 'path', 'href']);
        expect(parsed.protocol).to.be.equal('http:');
        expect(parsed.slashes).to.be.equal(true);
        expect(parsed.auth).to.be.equal(null);
        expect(parsed.host).to.be.equal('localhost:8080');
        expect(parsed.port).to.be.equal('8080');
        expect(parsed.hostname).to.be.equal('localhost');
        expect(parsed.hash).to.be.equal(null);
        expect(parsed.query).to.be.an('object');
        expect(parsed.query).to.have.all.keys(['baf']);
        expect(parsed.query.baf).to.be.equal('lek');
        expect(parsed.pathname).to.be.equal('/test');
        expect(parsed.path).to.be.equal('/test?baf=lek');
        expect(parsed.href).to.be.equal('http://localhost:8080/test?baf=lek');
    });
});
