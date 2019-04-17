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
                        promises.push(new Promise( (resolve, reject) => {
                            const worker = new Worker();
                            const addListener = worker.addEventListener || worker.on;
                            const removeListener = worker.removeEventListener || worker.off;
                            const handler = e => {
                                removeListener.call(worker, 'message', handler);
                                const message = e.data;
                                if (message.type === 'error') {
                                    reject(message);
                                } else {
                                    resolve(worker);
                                }
                            };
                            addListener.call(worker, 'message', handler);
                            const message = {
                                type: 'init',
                                options: {
                                    id: i,
                                    wasm: wasmModule,
                                },
                            };
                            worker.postMessage(kIsNodeJS ? { data: message } : message);
                        }));
                    }

                    const workers = await Promise.all(promises).catch(reason => { throw reason; });
                    workers.forEach(worker => WorkerPool.sharedInstance.addWorker(worker));
                    done(this);
                });
            }
            return await this[initializedSymbol];
        }

        terminate() {
            WorkerPool.sharedInstance.workers.forEach(worker => worker.terminate());
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
