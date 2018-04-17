import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Layout extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        initialData: PropTypes.any.isRequired,
        user: PropTypes.any,
        scripts: PropTypes.arrayOf(PropTypes.string),
        styles: PropTypes.arrayOf(PropTypes.string),
        version: PropTypes.string.isRequired,
    };

    static defaultProps = {
        user: null,
        scripts: [],
        styles: [],
    };

    render() {
        const {
            title, scripts, styles, version, initialData,
        } = this.props;
        return (
            <html>
                <head>
                    <meta charSet="UTF-8" />
                    <title>{title}</title>
                    {scripts.map((s, index) => <script key={index} src={`${s}?v=${version}`} type="text/javascript" />)}
                    {styles.map((s, index) => <link key={index} href={`${s}?v=${version}`} rel="stylesheet" />)}
                </head>
                <body>
                    <div id="container">
                        {this.renderContainerContent()}
                    </div>
                    <script type="text/plain" id="initial-data" data={JSON.stringify(initialData)} />
                    <script type="text/javascript" src={`/js/bundle.js?v=${version}`} />
                </body>
            </html>
        );
    }

    renderContainerContent() {
        return <div id="content" />;
    }
}
