import Application from './application';

export default {
	anchorNavigation: (e) => {
		e.preventDefault();
		const { href } = e.target;
		Application.navigate(href);
	},
};
