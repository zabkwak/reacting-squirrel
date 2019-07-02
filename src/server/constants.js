const TSConfig = {
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
    },
    include: [
        '../**/*',
    ],
    exclude: [
        'node_modules',
    ],
};

export {
    // eslint-disable-next-line import/prefer-default-export
    TSConfig,
};
