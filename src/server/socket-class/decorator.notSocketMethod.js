/* eslint-disable no-param-reassign */
/* eslint-disable func-names */

export default function notSocketMethod(target, name, descriptor) {
	try {
		target.addNotSocketMethod(target.constructor.name, name);
	} catch (e) { }
	return descriptor;
}
