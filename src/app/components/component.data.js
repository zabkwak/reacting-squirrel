import React from 'react';
import PropTypes from 'prop-types';
import async from 'async';

import SocketComponent from './component.socket';
import Loader from './loader';
import Text from './text';

export default class Data extends SocketComponent {

    static propTypes = {
        events: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string.isRequired,
            params: PropTypes.any,
            key: PropTypes.string,
        })).isRequired,
        renderData: PropTypes.func.isRequired,
        onError: PropTypes.func,
        onData: PropTypes.func,
        onStart: PropTypes.func,
        loaderBlock: Loader.propTypes.block,
        loaderSize: Loader.propTypes.size,
    };

    static defaultProps = {
        onError: null,
        onData: null,
        onStart: null,
        loaderBlock: true,
    };

    state = {
        data: null,
        took: null,
    };

    _tookTimeout = null;

    componentDidMount() {
        super.componentDidMount();
        this._loadData();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (this._tookTimeout !== null) {
            clearInterval(this._tookTimeout);
        }
    }

    load() {
        this.setState({ data: null, took: null });
        this._loadData();
    }

    render() {
        const { renderData, loaderBlock, loaderSize } = this.props;
        const { data } = this.state;
        const divProps = {};
        Object.keys(this.props).forEach((p) => {
            if (Object.keys(Data.propTypes).includes(p)) {
                return;
            }
            divProps[p] = this.props[p];
        });
        const loaded = Boolean(data);
        return (
            <div style={{ position: 'relative' }} {...divProps}>
                <Loader loaded={loaded} block={loaderBlock} size={loaderSize}>
                    {this.renderTook()}
                    {loaded && renderData(data)}
                </Loader>
            </div>
        );
    }

    renderTook() {
        const { took } = this.state;
        if (!this.getContext().DEV) {
            return null;
        }
        if (took === null) {
            return null;
        }
        return (
            <div
                style={{
                    position: 'absolute',
                    color: 'white',
                    background: 'rgba(200, 200, 200, .6)',
                    padding: 2,
                    fontSize: 10,
                    top: 0,
                    left: 0,
                    zIndex: 100,
                }}
            >
                {Text.format('{0}ms', took)}
            </div>
        );

    }

    _loadData() {
        const {
            events, onData, onError, onStart,
        } = this.props;
        const data = {};
        if (typeof onStart === 'function') {
            onStart();
        }
        const start = Date.now();
        async.each(events, ({ name, params, key }, callback) => {
            this.request(name, params, (err, r) => {
                if (err) {
                    callback(err);
                    return;
                }
                data[key || name] = r;
                callback();
            });
        }, (err) => {
            const took = Date.now() - start;
            const tookHandler = () => {
                if (this._tookTimeout !== null) {
                    clearTimeout(this._tookTimeout);
                }
                this._tookTimeout = setTimeout(() => {
                    this.setState({ took: null });
                }, 2500);
            };
            if (err) {
                if (typeof onError === 'function') {
                    onError(err);
                }
                this.setState({ took }, tookHandler);
                return;
            }
            this.setState({
                data: typeof onData === 'function' ? onData(data) || data : data,
                took,
            }, tookHandler);
        });
    }

}
