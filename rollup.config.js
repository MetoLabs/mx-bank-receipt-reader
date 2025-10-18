import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import inject from '@rollup/plugin-inject';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default [
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.browser.js',
            format: 'iife',
            name: 'BankReceiptReader',
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
            nodePolyfills()
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
            nodeResolve(),
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
            nodeResolve(),
            commonjs(),
            json(),
        ],
    },
];
