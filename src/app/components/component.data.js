import React from 'react';
import PropTypes from 'prop-types';
import async from 'async';

import SocketComponent from './component.socket';
import Loader from './loader';

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
        loaderBlock: Loader.propTypes.block,
        loaderSize: Loader.propTypes.size,
    };

    static defaultProps = {
        onError: null,
        onData: null,
        loaderBlock: true,
    };

    state = {
        data: null,
    };

    componentDidMount() {
        super.componentDidMount();
        this._loadData();
    }

    load() {
        this.setState({ data: null });
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
            <div {...divProps}>
                <Loader loaded={loaded} block={loaderBlock} size={loaderSize}>
                    {loaded && renderData(data)}
                </Loader>
            </div>
        );
    }

    _loadData() {
        const { events, onData, onError } = this.props;
        const data = {};
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
            if (err) {
                if (typeof onError === 'function') {
                    onError(err);
                }
                return;
            }
            if (typeof onData === 'function') {
                onData(data);
            }
            this.setState({ data });
        });
    }

}
