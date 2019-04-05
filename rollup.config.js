'use strict';

const path = require('path');
const packageJson = require('./package.json');
const eslint = require('rollup-plugin-eslint').eslint;
const liveServer = require('rollup-plugin-live-server');
const resolve = require('rollup-plugin-node-resolve');
const webWorkerLoader = require('rollup-plugin-web-worker-loader');
const urlLoader = require('rollup-plugin-url');

const JS_OUTPUT = `${packageJson.name}.js`;
const isBrowser = (process.env.TARGET === 'browser');
const outputName = JS_OUTPUT;

const config = {
    input: path.resolve(__dirname, packageJson.entry),
    output: [],
    plugins: [
        resolve(),
        eslint(),
        webWorkerLoader({
            sourcemap: isBrowser,
        }),
        urlLoader({
            limit: 1024 * 1024 * 1024, // 1GB - Basically unlimited
            include: ['**/*.wasm'],
            emitFiles: false,
        }),
    ],
};

if (isBrowser) {
    config.output.push({
        file: path.resolve(__dirname, `dist/iife/${outputName}`),
        format: 'iife',
        name: packageJson.name,
        sourcemap: 'inline',
    });

    config.plugins.push(liveServer({
        port: 8090,
        host: '0.0.0.0',
        root: 'www',
        file: 'index.html',
        mount: [['/dist/iife', './dist/iife']],
        open: false,
        wait: 500,
    }));
} else {
    config.output.push({
        file: path.resolve(__dirname, `dist/amd/${outputName}`),
        format: 'amd',
        sourcemap: true,
    });

    config.output.push({
        file: path.resolve(__dirname, `dist/cjs/${outputName}`),
        format: 'cjs',
        sourcemap: true,
    });

    config.output.push({
        file: path.resolve(__dirname, `dist/esm/${outputName}`),
        format: 'esm',
        sourcemap: true,
    });

    config.output.push({
        file: path.resolve(__dirname, `dist/umd/${outputName}`),
        format: 'umd',
        name: packageJson.name,
        sourcemap: true,
    });

    config.output.push({
        file: path.resolve(__dirname, `dist/iife/${outputName}`),
        format: 'iife',
        name: packageJson.name,
        sourcemap: true,
    });
}

module.exports = config;
