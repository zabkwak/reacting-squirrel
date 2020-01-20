import TagManager from 'react-gtm-module';
import Application, { Text, Socket, SocketRequest } from '../../src/app';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/app.css';

TagManager.initialize({
	gtmId: 'GTM-KQ3XSLZ',
});

Socket.setMaxMessageSize((2 ** 20) * 100);
console.log('Custom entry', 'imported');
Application.addListener('start', () => {
	console.log('Custom entry', 'Application started.');

	// Application.setLocale('default');
});
