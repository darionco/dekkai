import DataWorker from 'worker-loader!./Data.worker';
import {loadBlob, readRow} from './DataTools';

const kChunkSize = 1024 * 1024 * 4; // 4MB
const kHeaderMaxSize = 1024 * 256; // 256KB
let gManager = null;

class Manager {
    constructor(workerCount = 4) {
        this.mFile = null;
        this.mHeader = [];
        this.mChunks = [];
        this.mWorkers = [];
        this.mTasks = [];

        for (let i = 0; i < workerCount; ++i) {
            this.mWorkers.push(new DataWorker);
        }
    }

    async initialize(file) {
        this.mFile = file;
        let offset = await this._readHeader();

        const chunkOffsets = [];
        while (offset < this.mFile.size) {
            chunkOffsets.push({
                start: offset,
                end: Math.min(offset + kChunkSize, this.mFile.size),
            });
            offset += kChunkSize;
        }

        await this._calculateOffsets(file, chunkOffsets);
        for (let i = 0; i < chunkOffsets.length; ++i) {
            const blob = this.mFile.slice(chunkOffsets[i].start, chunkOffsets[i].end);
            this.mChunks.push(blob);
        }

        this._analyzeChunks(this.mChunks, 4);

        return this.mHeader;
    }

    async _readHeader() {
        const blob = this.mFile.slice(0, Math.min(kHeaderMaxSize, this.mFile.size));
        const buffer = await loadBlob(blob);
        const view = new DataView(buffer);
        const columns = [];
        const offset = readRow(view,0, columns);

        for (let i = 0; i < columns.length; ++i) {
            this.mHeader.push({
                name: String.fromCharCode(...columns[i]),
                type: null,
                minLength: null,
                maxLength: null,
            });
        }

        return offset;
    }

    _calculateOffsets(file, offsets) {
        const promises = [];
        for (let i = 0, n = offsets.length - 1; i < n; ++i) {
            const options = Object.assign({}, { index: i, file }, offsets[i]);
            promises.push(this._scheduleTask('calculateOffsets', options));
        }

        return Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; ++i) {
                offsets[results[i].index].end += results[i].offset;
                offsets[results[i].index + 1].start += results[i].offset;
            }
        });
    }

    _analyzeChunks(chunks, workerCount) {
        const start = new Date();

        const promises = [];
        const workers = [];
        const tasks = [];

        while (workers.length < workerCount && this.mWorkers.length) {
            workers.push(this.mWorkers.pop());
        }

        for (let i = 0; i < chunks.length; ++i) {
            promises.push(this._scheduleTask('analyzeBlob', {
                header: this.mHeader,
                index: i,
                blob: chunks[i],
            }, workers, tasks));
        }

        return Promise.all(promises).then(() => console.log(`Analysis took: ${new Date() - start}ms`));
    }

    _scheduleTask(type, options, workerPool = this.mWorkers, taskQueue = this.mTasks) {
        return new Promise((resolve, reject) => {
            if (workerPool.length) {
                this._executeTask(workerPool.pop(), type, options, resolve, reject, workerPool, taskQueue);
            } else {
                taskQueue.unshift({
                    type,
                    options,
                    resolve,
                    reject,
                });
            }
        });
    }

    _executeTask(worker, type, options, resolve, reject, workerPool, taskQueue) {
        worker.onmessage = e => {
            const message = e.data;
            worker.onmessage = null;

            if (message.type === 'success') {
                resolve(message.data);
            } else if (message.type === 'error') {
                reject(message.reason);
            } else {
                throw `ERROR: Unrecognized message type sent from data worker "${message.type}"`;
            }

            if (taskQueue.length) {
                const task = taskQueue.pop();
                this._executeTask(worker, task.type, task.options, task.resolve, task.reject, workerPool, taskQueue);
            } else {
                workerPool.push(worker);
            }
        };

        worker.postMessage({
            type,
            options,
        });
    }
}

function sendError(id, reason) {
    global.postMessage({
        type: 'error',
        id,
        reason,
    });
}

function sendSuccess(id, data = null) {
    global.postMessage({
        type: 'success',
        id,
        data,
    });
}

global.onmessage = async function CSVManagerWorkerOnMessage(e) {
    const message = e.data;
    switch (message.type) {
        case 'initialize':
            if (gManager) {
                sendError(message.id, 'CSV::Manager::Worker already initialized');
            } else {
                const start = new Date();
                gManager = new Manager();
                sendSuccess(message.id, await gManager.initialize(message.file));
                const end = new Date();
                console.log(`Initialization took:${end - start}ms`);
            }
            break;

        default:
            sendError(message.id, `Unrecognized message type "$message.type{}"`);
            break;
    }
};
