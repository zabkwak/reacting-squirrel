// import '@babel/polyfill';
import Application, { Text } from '../../src/app';

import dictionaryCzech from './res/text_cs-CZ.json';

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
