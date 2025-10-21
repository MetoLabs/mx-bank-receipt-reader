import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-node-polyfills';

/**
 * Rollup config to build for:
 * - Browser (IIFE) → dist/bank-receipt-reader.browser.js
 * - Node (CommonJS) → dist/bank-receipt-reader.cjs
 * - Modern bundlers (ESM) → dist/bank-receipt-reader.esm.js
 */

const commonPlugins = [
    nodeResolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    json(),
];

export default [
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.browser.js',
            format: 'iife',
            name: 'BankReceiptReader',
            interop: 'default',
            sourcemap: false, // DESACTIVA sourcemap para IIFE
        },
        plugins: [
            ...commonPlugins,
            {
                name: 'global-polyfill',
                renderChunk(code) {
                    return { code: 'var global = window;\n' + code, map: null };
                },
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
                },
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
            sourcemap: true,
        },
        plugins: commonPlugins,
    },
    {
        input: 'src/bank-receipt-reader.js',
        output: {
            file: 'dist/bank-receipt-reader.esm.js',
            format: 'esm',
            sourcemap: true,
        },
        plugins: commonPlugins,
    },
];