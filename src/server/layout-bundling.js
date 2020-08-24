/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';

export default class BundleLayout extends Component {

	render() {
		const { lang } = this.props;
		return (
			<html lang={lang}>
				<head>
					<title>Bundling</title>
				</head>
				<body>
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							textAlign: 'center',
							transform: 'translate(-50%, -50%)',
							WebkitTransform: 'translate(-50%, -50%)',
							fontFamily: 'Arial',
						}}
					>
						<h2>
							Bundling
						</h2>
						<p>
							The app is restarting and will be on-line shortly.
						</p>
					</div>
				</body>
			</html>
		);
	}
}
