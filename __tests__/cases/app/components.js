import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

import chai, { expect } from 'chai';
import Enzyme, { mount, shallow } from 'enzyme';
import chaiEnzyme from 'chai-enzyme';

import '../../globals';

import { Text, DataComponent, CallbackEmitter } from '../../../src/app';

Enzyme.configure({ adapter: new Adapter() });

chai.use(chaiEnzyme());

describe('<DataComponent />', () => {

	it('renders the content of the test event', (done) => {
		const wrapper = shallow(
			<DataComponent
				events={[{ name: 'test' }]}
				renderData={({ test }) => <span>{test}</span>}
			/>
		);
		wrapper.setState({ data: { test: 'test' } });
		wrapper.update();
		expect(wrapper.contains(<span>test</span>)).to.equal(true);
		done();
	});
});

describe('<Text />', () => {

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