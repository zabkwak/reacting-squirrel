import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Base layout component for default html code rendered on the server-side.
 */
export default class Layout extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        initialData: PropTypes.any.isRequired,
        user: PropTypes.any,
        scripts: PropTypes.arrayOf(PropTypes.string),
        styles: PropTypes.arrayOf(PropTypes.string),
        version: PropTypes.string.isRequired,
        bundle: PropTypes.string.isRequired,
        charSet: PropTypes.string,
        lang: PropTypes.string,
    };

    static defaultProps = {
        user: null,
        scripts: [],
        styles: [],
        charSet: 'UTF-8',
        lang: 'en_US',
    };

    /**
     * Renders the base html. This method shouldn't be overriden.
     */
    render() {
        const {
            title, scripts, styles, version, initialData, bundle, charSet, lang,
        } = this.props;
        return (
            <html lang={lang}>
                <head>
                    <meta charSet={charSet} />
                    <title>{title}</title>
                    {scripts.map((s, index) => <script key={index} src={`${s}?v=${version}`} type="text/javascript" />)}
                    {styles.map((s, index) => <link key={index} href={`${s}?v=${version}`} rel="stylesheet" />)}
                </head>
                <body>
                    {this.renderContainer()}
                    <script type="text/plain" id="initial-data" data={JSON.stringify(initialData)} />
                    <script type="text/javascript" src={`${bundle}?v=${version}`} />
                </body>
            </html>
        );
    }

    /**
     * Renders the container of the website.
     */
    renderContainer() {
        return (
            <div id="container">
                <div id="content">
                    {this.renderLoader()}
                </div>
            </div>
        );
    }

    renderLoader() {
        return (
            <img
                src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif"
                alt="loading"
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    WebkitTransform: 'translate(-50%, -50%)',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        );
    }
}
