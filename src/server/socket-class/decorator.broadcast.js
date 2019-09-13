/* eslint-disable func-names */

export default function broadcast(filter = null, event = null, includeSelf = false) {
	return function (target, name, descriptor) {
		const ev = `${target.constructor.name.toLowerCase()}.${name}`;
		const original = descriptor.value;
		if (typeof original === 'function') {
			// eslint-disable-next-line no-param-reassign
			descriptor.value = function (...args) {
				const socket = args[0];
				const r = original.apply(this, args);
				if (r instanceof Promise) {
					r
						.then((data) => {
							socket.broadcast(event || ev, { data }, includeSelf, filter);
						})
						// The error is handled in the SocketClass. This code prevents logging of the UnhandledPromiseRejection.
						.catch((e) => { });
				} else {
					// eslint-disable-next-line no-console
					console.warn('Broadcast decorator is not supported in non-promise socket method.');
				}
				return r;
			};
		}
	};
}
