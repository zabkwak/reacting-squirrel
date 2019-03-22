import React from 'react';
import PropTypes from 'prop-types';

import Component from './component';

/**
 * Component for navigation throught the application. The click event calls {Application.navigate} method.
 * @deprecated
 */
export default class Button extends Component {

    static propTypes = {
        href: PropTypes.string,
        refreshContent: PropTypes.bool,
    };

    static defaultProps = {
        href: null,
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
        const {
            refreshContent,
            ...props
        } = this.props;
        return <button type="button" onClick={this._click} {...props} />;
    }
}
