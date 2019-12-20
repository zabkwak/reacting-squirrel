import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

import chai, { expect } from 'chai';
import Enzyme, { mount } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';

import '../../globals';

import { Text } from '../../../src/app';

Enzyme.configure({ adapter: new Adapter() });

chai.use(chaiEnzyme());

describe('<Text />', () => {

	// Text.addDictionary('default', { test: 'test', testJSX: '<strong>test</strong>', testArgs: 'test {0} {1}' });

	it('checks if the wrapper contains rendered span with the value from dictionary', () => {
		const wrapper = mount(<Text dictionaryKey="mocha_test" />);
		expect(wrapper.contains(<span>test</span>)).to.equal(true);
	});

	it('checks if the wrapper contains rendered span with the value from dictionary with JSX', () => {
		const wrapper = mount(<Text dictionaryKey="mocha_test_jsx" />);
		expect(wrapper.contains(<span><strong>test</strong></span>)).to.equal(true);
	});

	it('checks if the wrapper contains rendered span with value from dictionary with arguments', () => {
		const wrapper = mount(<Text dictionaryKey="mocha_test_args" args={['test_0', 'test_1']} />);
		expect(wrapper.contains(<span>test test_0 test_1</span>)).to.equal(true);
	});

	it('checks if the wrapper contains different tag', () => {
		const wrapper = mount(<Text dictionaryKey="mocha_test" tag="h4" />);
		expect(wrapper.contains(<h4>test</h4>)).to.equal(true);
	});

});