import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import json from '@rollup/plugin-json';

export default [
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.browser.js',
            format: 'iife',
            name: 'BankReceiptReader',
            globals: {
                'path': 'path',
                'url': 'url'
            }
        },
        external: ['path', 'url'],
        plugins: [
            nodeResolve({ browser: true }),
            commonjs(),
            nodePolyfills(),
            json()
        ]
    },
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.cjs',
            format: 'cjs',
            exports: 'default'
        },
        external: ['path', 'url'],
        plugins: [
            nodeResolve(),
            commonjs(),
            json()
        ]
    },
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.esm.js',
            format: 'esm'
        },
        external: ['path', 'url'],
        plugins: [
            nodeResolve(),
            commonjs(),
            json()
        ]
    }
];