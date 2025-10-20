import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default [
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.browser.js',
            format: 'iife',
            name: 'BankReceiptReader',
            interop: 'default'
        },
        plugins: [
            nodeResolve({ browser: true }),
            commonjs(),
            json(),
            {
                name: 'global-polyfill',
                renderChunk(code) {
                    return { code: 'var global = window;\n' + code, map: null };
                }
            },
            {
                name: 'ignore-encoding',
                resolveId(source) {
                    if (source === 'encoding') return source;
                    return null;
                },
                load(id) {
                    if (id === 'encoding') return 'export default {};';
                    return null;
                }
            },
            nodePolyfills(),
            terser({ format: { comments: false } }),
        ],
        external: ['path'],
    },
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.cjs',
            format: 'cjs',
            exports: 'default',
        },
        plugins: [
            nodeResolve({ browser: true, preferBuiltins: false }),
            commonjs(),
            json(),
        ],
    },
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.esm.js',
            format: 'esm',
        },
        plugins: [
            nodeResolve({ browser: true, preferBuiltins: false }),
            commonjs(),
            json(),
        ],
    },
];