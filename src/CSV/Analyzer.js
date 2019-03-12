import DataWorker from 'worker-loader!./Data.worker';
import {WorkerPool} from './WorkerPool';

export class Analyzer {
    static createWorkers(count) {
        const workers = [];
        for (let i = 0; i < count; ++i) {
            workers.push(new DataWorker());
        }
    }

    constructor(header, chunks) {
        this.mHeader = header;
        this.mChunks = chunks;
        this.mWorkerPool = new WorkerPool();
        this.mRunning = false;
        this.mChunkMeta = [];
        this.mColumns = {};
        this.mRowCount = 0;
        this.mTotalChunks = this.mChunks.length;
        this.mProcessedChunks = 0;
        this.mTotalBytes = 0;
        this.mProcessedBytes = 0;

        for (let i = 0; i < this.mHeader.length; ++i) {
            this.mColumns[this.mHeader[i].name] = {
                number: {
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    isFloat: false,
                    count: 0,
                },
                string: {
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    count: 0,
                },
            };
        }
    }

    get running() {
        return this.mRunning;
    }

    get progress() {
        if (this.mTotalBytes) {
            return this.mProcessedBytes / this.mTotalBytes;
        }
        return 0;
    }

    get workerCount() {
        return this.mWorkerPool.workerCount;
    }

    get workerPool() {
        return this.mWorkerPool;
    }

    get estimatedRowCount() {
        if (this.mTotalBytes !== this.mProcessedBytes) {
            return Math.round(this.mRowCount * (this.mTotalBytes / this.mProcessedBytes));
        }
        return this.mRowCount;
    }

    get rowCount() {
        return this.mRowCount;
    }

    get chunkMeta() {
        return this.mChunkMeta;
    }

    run(workers, cb = null, killWorkers = false) {
        workers.forEach(worker =>{
            this.addWorker(worker);
        });

        this.mRunning = true;

        const start = new Date();
        const promises = [];

        for (let i = 0; i < this.mChunks.length; ++i) {
            this.mTotalBytes += this.mChunks[i].size;
            promises.push(this.mWorkerPool.scheduleTask('analyzeBlob', {
                header: this.mHeader,
                index: i,
                blob: this.mChunks[i],
            }).then(result => {
                this.mChunkMeta[result.index] = result;

                let name;
                let totalColumn;
                let resultColumn;
                for (let ii = 0; ii < this.mHeader.length; ++ii) {
                    name = this.mHeader[ii].name;
                    totalColumn = this.mColumns[name];
                    resultColumn = result.columns[name];

                    totalColumn.number.min = Math.min(totalColumn.number.min, resultColumn.number.min);
                    totalColumn.number.max = Math.min(totalColumn.number.max, resultColumn.number.max);
                    totalColumn.number.isFloat = totalColumn.number.isFloat || resultColumn.number.isFloat;
                    totalColumn.number.count += resultColumn.number.count;

                    totalColumn.string.min = Math.min(totalColumn.string.min, resultColumn.string.min);
                    totalColumn.string.max = Math.min(totalColumn.string.max, resultColumn.string.max);
                    totalColumn.string.count += resultColumn.string.count;
                }

                this.mRowCount += result.count;

                ++this.mProcessedChunks;
                this.mProcessedBytes += this.mChunks[result.index].size;

                if (cb) {
                    cb(result, this.progress, this.estimatedRowCount);
                }
            }));
        }

        return Promise.all(promises).then(() => {
            this.mRunning = false;
            console.log(`Analysis took: ${new Date() - start}ms`);

            if (killWorkers) {
                while (this.mWorkerPool.workers.length) {
                    this.mWorkerPool.removeWorker().postMessage({type: 'close'});
                }
            }

            console.log(this.mColumns);
            console.log(this.mRowCount);
        });
    }

    addWorker(worker) {
        this.mWorkerPool.addWorker(worker);
    }
}
