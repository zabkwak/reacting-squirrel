import { expect } from 'chai';

import { Application } from '../../../src/app';

describe('Application', () => {

    it('checks if the application instance is correctly created', () => {
        expect(Application.DEV).to.be.equal(false);
    });
});
