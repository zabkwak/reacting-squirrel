import React from 'react';

import { Page, Button, Text, Loader, DataComponent } from '../../src/app';

import './home.css';
import './home.scss';

export default class Home extends Page {

    state = {
        user: null,
    };

    _pageRender = (context, page) => console.log('PAGE RENDERED');

    componentDidMount() {
        super.componentDidMount();
        this.emit('user.get');
        this.on('user.get', (err, user) => {
            if (err) {
                console.error(err);
                return;
            }
            this.setState({ user });
        });
        this.request('user.getPromise', (err, user) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Getting user using Promise', user);
        });
        this.request('user.getAsyncError', (err) => {
            
        });
        this.getContext().addListener('pagerender', this._pageRender);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.getContext().removeListener('pagerender', this._pageRender);
    }

    render() {
        const { user } = this.state;
        return (
            <div className="home-wrapper">
                <Text tag="h1" dictionaryKey="home" />
                {/* <h2>{user ? user.name : '...'}</h2> */}
                <h2>
                    <Loader loaded={Boolean(user)} block={false} size="small">
                        {user ? user.name : null}
                    </Loader>
                </h2>
                <DataComponent
                    className="data-component"
                    events={[{
                        name: 'user.getPromise',
                        key: 'user',
                    }]}
                    renderData={({ user }) => <h2>{user.name}</h2>}
                    loaderBlock={false}
                    loaderSize="small"
                />
                <Button href="/about" id="navigate-button">About page</Button>
                <Button href="/" id="refresh-button" refreshContent>Refresh content</Button>
                <Button href="/test" id="test-button">Invalid page</Button>
                <Button id="state-button" onClick={() => this.getContext().pushState(null, { test: 1 })}>Push state query</Button>
                <div>
                    <Text tag="p" dictionaryKey="args" args={['one', 'two', 'three']} />
                </div>
            </div>
        );
    }
}
