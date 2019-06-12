import TagManager from 'react-gtm-module';
import Application, { Text, Socket } from '../../src/app';

import dictionaryCzech from './res/text_cs-CZ.json';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/app.css';

TagManager.initialize({
    gtmId: 'GTM-KQ3XSLZ',
});

Socket.setMaxMessageSize((2 ** 20) * 100);
console.log('Custom entry', 'imported');
Application.addListener('start', () => {
    console.log('Custom entry', 'Application started.');
    Text.addDictionary('cs-CZ', dictionaryCzech);
    let dictionary = 'default';
    if (navigator && navigator.language) {
        dictionary = navigator.language;
    }
    Text.setDictionary(dictionary);
});

const doAsync = async () => {
    return true;
};

(async () => {
    console.log('ASYNC', await doAsync());
})();
