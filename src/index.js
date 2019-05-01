import {WorkerPool} from './workers/WorkerPool';
import Worker from 'web-worker:./workers/Worker';
import {Table} from './csv/Table';
import {WebCPU} from 'webcpu';
import wasmData from './wasm/bin/Parser.wasm';

/* handle running in node.js */
const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

const _dekkai = (function() {
    const initializedSymbol = Symbol('dekkai::initialized');
    class dekkai {
        constructor() {
            this[initializedSymbol] = null;
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

        async loadLocalFile(file, options = null) {
            await this.init();
            return await Table.fromFile(file, options);
        }

        async loadFromURL(url, options = null) {
            await this.init();
            return await Table.fromURL(url, options);
        }

        async loadFromString(str, options = null) {
            await this.init();
            return await Table.fromString(str, options);
        }
    }

    return new dekkai(); // eslint-disable-line
})();

export default _dekkai;
