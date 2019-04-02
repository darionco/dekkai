import {WorkerPool} from './workers/WorkerPool';
import Worker from 'web-worker:./workers/Worker';
import {Table} from './csv/Table';
import {WebCPU} from 'webcpu';
import wasmData from './wasm/bin/Parser.wasm';

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

                    const wasmModule = await WebAssembly.compileStreaming(fetch(wasmData));

                    const promises = [];
                    for (let i = 0; i < threads; ++i) {
                        promises.push(new Promise( (resolve, reject) => {
                            const worker = new Worker();
                            worker.onmessage = e => {
                                worker.onmessage = null;
                                const message = e.data;
                                if (message.type === 'error') {
                                    reject(message);
                                } else {
                                    resolve(worker);
                                }
                            };
                            worker.postMessage({
                                type: 'init',
                                options: {
                                    id: i,
                                    wasm: wasmModule,
                                },
                            });
                        }));
                    }

                    const workers = await Promise.all(promises).catch(reason => { throw reason; });
                    workers.forEach(worker => WorkerPool.sharedInstance.addWorker(worker));
                    done(this);
                });
            }
            return await this[initializedSymbol];
        }

        async loadLocalFile(file, options = null) {
            await this.init();
            return await Table.fromFile(file, options);
        }

        async loadFromURL(url, options = null) {
            await this.init();
            return await Table.fromURL(url, options);
        }
    }

    return new dekkai(); // eslint-disable-line
})();

export default _dekkai;
