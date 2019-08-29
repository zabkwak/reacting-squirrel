import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Text from 'texting-squirrel';
import { Parser } from 'html-to-react';

const parser = new Parser();

export default class TextComponent extends Component {

	static propTypes = {
		dictionaryKey: PropTypes.string.isRequired,
		tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
		args: PropTypes.arrayOf(PropTypes.any),
		jsx: PropTypes.bool,
	};

	static defaultProps = {
		tag: 'span',
		args: [],
		jsx: true,
	};

	static addDictionary(key, dictionary) {
		Text.addDictionary(key, dictionary);
		return this;
	}

	static setDictionary(key) {
		Text.setDictionary(key);
		return this;
	}

	static addFunction(name, fn) {
		Text.addFunction(name, fn);
		return this;
	}

	static get(key, ...args) {
		return Text.get(key, ...args);
	}

	static getJSX(key, ...args) {
		return parser.parse(this.get(key, ...args));
	}

	static format(text, ...args) {
		return Text.format(text, ...args);
	}

	static formatJSX(key, ...args) {
		return parser.parse(this.format(key, ...args));
	}

	render() {
		const {
			args,
			dictionaryKey,
			tag,
			jsx,
			...props
		} = this.props;
		const Tag = tag;
		const value = Text.get.apply(Text, [dictionaryKey, ...args]);
		return <Tag {...props}>{jsx ? parser.parse(value) : value}</Tag>;
	}
}
