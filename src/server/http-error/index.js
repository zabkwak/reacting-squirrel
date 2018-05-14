import SmartError from 'smart-error';

import codes from './codes.json';

export default class HttpError extends SmartError {

    static create(statusCode, message = null, code = null, payload = {}) {
        const c = this.getCode(statusCode);
        return new this(statusCode, message || c.message, code || c.code, payload);
    }

    static getCode(statusCode) {
        return codes[statusCode] || codes[500];
    }

    constructor(statusCode, message, code, payload = {}) {
        super(message, code, Object.assign(payload, { statusCode }));
    }
}
