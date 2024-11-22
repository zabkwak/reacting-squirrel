import { Button as MuiButton } from '@mui/material';
import * as React from 'react';
import { Button as BSButton } from 'react-bootstrap';

import { Page } from '../../src/app';

export default class UiPage extends Page {
	public render(): JSX.Element {
		return (
			<>
				<MuiButton variant="contained" color="primary">
					Material UI
				</MuiButton>
				<BSButton variant="primary">Bootstrap</BSButton>
			</>
		);
	}
}
