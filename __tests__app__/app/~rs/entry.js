import './nonce';
import Application, { Socket, Text } from '../../../src/app';
import ErrorPage from '../page.error';
import '../entry';
import routingMap from './router.map';
import socketEvents from './socket.map';
import components from './component.map';

import defaultDictionary from '../res/text.json';

Text.addDictionary(defaultDictionary);

Application
			.registerRoutingMap(routingMap)
			.registerComponents(components)
			.registerErrorPage(ErrorPage)
			.start();
Socket
			.registerEvents(socketEvents)
			.connect();
		