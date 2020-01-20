import React from 'react';

import { Component, Text } from '../../src/app';

export default class Test extends Component {

	render() {
		return (
			<>
				<h3>{this.getText('header')}</h3>
				<span>{this.getText('html_text')}</span>
				|
                <span>{this.getJSXText('html_text')}</span>
				|
                <Text dictionaryKey="html_text" />
			</>
		);
	}
}
