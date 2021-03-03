/* eslint-disable max-len */
/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';

export default class BundleLayout extends Component {

	render() {
		// eslint-disable-next-line react/prop-types
		const { lang } = this.props;
		return (
			<html lang={lang}>
				<head>
					<title>Bundling 0%</title>
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
						<p id="progress">
							0%
						</p>
						<script
							type="text/javascript"
							// eslint-disable-next-line react/no-danger
							dangerouslySetInnerHTML={{
								// eslint-disable-next-line quotes
								__html: `function check(){var e=new XMLHttpRequest;e.addEventListener("load",function(e){if(this.status>=400)console.error("Bundling status error",this.statusText);else{var t=parseInt(this.responseText,10);isNaN(t)&&(t=0),document.getElementById("progress").textContent=t+"%",document.getElementsByTagName("title")[0].textContent="Bundling "+t+"%",t>=100?location.reload(!0):setTimeout(check,500)}},!1),e.open("GET","/bundle-status"),e.send()}check();`,
							}}
						/>
					</div>
				</body>
			</html>
		);
	}
}
