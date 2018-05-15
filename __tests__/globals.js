global.document = {
    getElementById: id => null,
    getElementsByTagName: name => [null],
};
global.window = {};
global.location = {
    href: 'http://localhost:8080/test?baf=lek',
    reload: () => { },
};
