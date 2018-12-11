import React from 'react';
import PropTypes from 'prop-types';

import Component from './component';

/**
 * Component for navigation throught the application. The click event calls {Application.navigate} method.
 */
export default class Button extends Component {

    static propTypes = {
        href: PropTypes.string.isRequired,
        refreshContent: PropTypes.bool,
    };

    static defaultProps = {
        refreshContent: false,
    };

    _click = () => {
        const { href, refreshContent } = this.props;
        if (!href) {
            return;
        }
        this.getContext().navigate(href, null, refreshContent);
    };

    render() {
        const props = {};
        Object.keys(this.props).forEach((k) => {
            if (['refreshContent'].indexOf(k) >= 0) {
                return;
            }
            props[k] = this.props[k];
        });
        return <button onClick={this._click} {...props} />;
    }
}
