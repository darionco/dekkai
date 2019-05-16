import {WorkerPool} from './workers/WorkerPool';
import Worker from 'web-worker:./workers/Worker';
import {Table} from './csv/Table';
import {WebCPU} from 'webcpu';
import wasmData from './wasm/bin/Parser.wasm';
import {DataFile} from './data/DataFile';
import * as DataTools from './data/DataTools';
import {BinaryTable} from './CSV/BinaryTable';

/* handle running in node.js */
const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

const _dekkai = (function() {
    const initializedSymbol = Symbol('dekkai::initialized');

    class dekkai {
        constructor() {
            this[initializedSymbol] = null;
        }

        get DataFile() {
            return DataFile;
        }

        get DataTools() {
            return DataTools;
        }

        get WorkerPool() {
            return WorkerPool;
        }

        async init(workerCount = -1) {
            if (!this[initializedSymbol]) {
                this[initializedSymbol] = new Promise(async done => {
                    let threads = workerCount;
                    if (threads < 1 || isNaN(threads)) {
                        const webCPUResult = await WebCPU.detectCPU();
                        threads = webCPUResult.estimatedPhysicalCores;
                    }

                    let wasmModule = null;
                    if (WebAssembly) {
                        if (WebAssembly.compileStreaming) {
                            wasmModule = await WebAssembly.compileStreaming(fetch(wasmData));
                        } else if (WebAssembly.compile) {
                            if (kIsNodeJS) {
                                const buffer = Buffer.from(wasmData.substr(wasmData.indexOf(',') + 1), 'base64');
                                wasmModule = await WebAssembly.compile(buffer);
                            } else {
                                const result = await fetch(wasmData);
                                const buffer = await result.arrayBuffer();
                                wasmModule = await WebAssembly.compile(buffer);
                            }
                        }
                    }

                    const promises = [];
                    for (let i = 0; i < threads; ++i) {
                        const promise = WorkerPool.sharedInstance.addWorker(new Worker(), {
                            type: 'init',
                            options: {
                                id: i,
                                wasm: wasmModule,
                            },
                        });
                        promises.push(promise);
                    }
                    await Promise.all(promises);
                    done(this);
                });
            }
            return await this[initializedSymbol];
        }

        terminate() {
            WorkerPool.sharedInstance.killWorkers();
            this[initializedSymbol] = null;
        }

        async iterateLocalFile(file, itr, options = null) {
            await this.init();
            const dataFile = new DataFile(file);
            const config = Object.freeze(Object.assign({}, DataTools.defaultConfig, options));
            const {header, offset} = await DataTools.readHeader(dataFile, config);
            const blobs = await DataTools.sliceFile(dataFile, offset, config);
            await DataTools.iterateBlobs(blobs, header, itr, config);
        }

        async binaryFromLocalFile(file, options = null) {
            await this.init();
            return await BinaryTable.fromFile(file, options);
        }

        async binaryFromURL(url, options = null) {
            await this.init();
            return await BinaryTable.fromURL(url, options);
        }

        async binaryFromString(str, options = null) {
            await this.init();
            return await BinaryTable.fromString(str, options);
        }

        async tableFromLocalFile(file, options = null) {
            await this.init();
            return await Table.fromFile(file, options);
        }

        async tableFromURL(url, options = null) {
            await this.init();
            return await Table.fromURL(url, options);
        }

        async tableFromString(str, options = null) {
            await this.init();
            return await Table.fromString(str, options);
        }
    }

    return new dekkai(); // eslint-disable-line
})();

export default _dekkai;
