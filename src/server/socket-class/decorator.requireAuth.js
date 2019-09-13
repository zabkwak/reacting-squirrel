/* eslint-disable func-names */
import HttpError from 'http-smart-error';

export default function requireAuth(target, name, descriptor) {
	const original = descriptor.value;
	if (typeof original === 'function') {
		// eslint-disable-next-line no-param-reassign
		descriptor.value = function (...args) {
			const socket = args[0];
			if (!socket.getSession().getUser()) {
				throw HttpError.create(401);
			}
			return original.apply(this, args);
		};
	}
	return descriptor;
}
