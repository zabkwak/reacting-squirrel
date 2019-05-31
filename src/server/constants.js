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
    },
    include: [
        '../**/*',
    ],
    exclude: [
        'node_modules',
    ],
};

export {
    TSConfig,
};
