export const TSConfig = {
	compilerOptions: {
		module: 'commonjs',
		noImplicitAny: true,
		removeComments: true,
		preserveConstEnums: true,
		sourceMap: true,
		declaration: false,
		target: 'es5',
		jsx: 'react',
		lib: [
			'es6',
			'dom',
		],
		resolveJsonModule: true,
		experimentalDecorators: true,
	},
	include: [
		'../**/*',
	],
	exclude: [
		'node_modules',
	],
};
export const BABEL_TRANSPILE_MODULES = ['debug', 'uniqid'];
export const RS_DIR = '~rs';
