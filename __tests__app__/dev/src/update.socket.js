import { SocketClass } from '../../../server';

export default class Update extends SocketClass {

	async init(socket) {
		/*
		setInterval(() => {
			socket.emit('update.update', { data: new Date() });
		}, 1000);
		*/
		return new Date();
	}

	update() { }
}
