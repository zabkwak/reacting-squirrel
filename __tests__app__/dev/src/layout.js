import React from 'react';
import { Layout } from '../../../server';

export default class AnotherLayout extends Layout {
	renderContainer() {
		return (
			<div id="container">
				<div id="content">
					{this.renderLoader()}
				</div>
				<h4>TEST</h4>
				<a href="/about" className="ssr-nav">About</a>
			</div>
		);
	}
}
