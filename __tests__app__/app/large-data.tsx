import * as React from 'react';

import { IPageProps, Page } from '../../src/app';

const DATA = new Array(10000).fill('').map((_, index) => ({
	index,
	title: `Item ${index}`,
}));

interface IState {
	data: any[];
}

export default class Large_dataPage extends Page<IPageProps, IState> {

	public state: IState = {
		data: null,
	};

	public componentDidMount(): void {
		super.componentDidMount();
		setTimeout(() => {
			this.setState({ data: DATA });
		}, 300);
	}

	public componentWillUnmount(): void {
		super.componentWillUnmount();
		this.setState({ data: null });
	}

	public render(): JSX.Element {
		const { data } = this.state;
		if (!data) {
			return null;
		}
		return (
			<table>
				<tbody>
					{
						DATA.map(({ index, title }) => (
							<tr key={index}>
								<td>{index}</td>
								<td>{title}</td>
							</tr>
						))
					}
				</tbody>
			</table>
		);
	}
}
