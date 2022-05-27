import * as React from 'react';
import { Button as MDButton } from '@material-ui/core';
import { Button as BSButton } from 'react-bootstrap';

import { Page } from '../../src/app';

export default class UiPage extends Page {

	public render(): JSX.Element {
		return (
			<>
				<MDButton variant="contained" color="primary">Material UI</MDButton>
				<BSButton variant="primary">Bootstrap</BSButton>
			</>
		)
	}
}
