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
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		skipLibCheck: true,
	},
	include: [
		'../**/*',
	],
	exclude: [
		'node_modules',
	],
};
export const BABEL_TRANSPILE_MODULES = ['debug', 'uniqid', 'texting-squirrel'];
export const RS_DIR = '~rs';
export const CONFIG_ENV_PREFIX = '$env:';
export const BUNDLE_STATUS_ROUTE = '/bundle-status';
