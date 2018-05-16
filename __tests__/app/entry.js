import Application from '../../src/app';

console.log('Custom entry', 'imported');
Application.addListener('start', () => console.log('Custom entry', 'Application started.'));
