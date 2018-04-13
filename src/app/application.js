import ReactDOM from 'react-dom';

class Application {

    _content = null;

    constructor() {
        this._content = document.getElementById('content');
    }

    render(route, refresh = false) {

    }

    _render(component) {
        ReactDOM.render(component, this._content);
    }
}

export default new Application();
