import DataWorker from 'worker-loader!./Data.worker';
import {loadBlob, readRow} from './DataTools';
import {WorkerPool} from './WorkerPool';
import {Analyzer} from './Analyzer';

const kChunkSize = 1024 * 1024 * 4; // 4MB
const kHeaderMaxSize = 1024 * 256; // 256KB
let gManager = null;

class Manager {
    constructor(workerCount = 4) {
        this.mFile = null;
        this.mHeader = [];
        this.mChunks = [];
        this.mAnalyzer = null;
        this.mWorkerPool = new WorkerPool();

        for (let i = 0; i < workerCount; ++i) {
            this.mWorkerPool.addWorker(new DataWorker());
        }
    }

    destroy() {
        while (this.mWorkerPool.workers.length) {
            this.mWorkerPool.removeWorker().terminate();
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

        const workers = [];
        let killWorkers = false;

        if (this.mWorkerPool.workerCount === 1) {
            workers.push(new DataWorker());
            killWorkers = true;
        } else if (this.mWorkerPool.workerCount === 2) {
            workers.push(this.mWorkerPool.removeWorker());
        } else {
            while (this.mWorkerPool.workerCount > 2) {
                workers.push(this.mWorkerPool.removeWorker());
            }
        }

        this.mAnalyzer = new Analyzer(this.mHeader, this.mChunks);
        this.mAnalyzer.run(workers, killWorkers).then(() => {
            if (!killWorkers) {
                while (this.mAnalyzer.workerCount) {
                    this.mWorkerPool.addWorker(this.mAnalyzer.workerPool.removeWorker());
                }
            }
        });

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
            promises.push(this.mWorkerPool.scheduleTask('calculateOffsets', options));
        }

        return Promise.all(promises).then(results => {
            for (let i = 0; i < results.length; ++i) {
                offsets[results[i].index].end += results[i].offset;
                offsets[results[i].index + 1].start += results[i].offset;
            }
        });
    }
}

function sendError(id, reason) {
    self.postMessage({
        type: 'error',
        id,
        reason,
    });
}

function sendSuccess(id, data = null) {
    self.postMessage({
        type: 'success',
        id,
        data,
    });
}

self.onmessage = async function CSVManagerWorkerOnMessage(e) {
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

        case 'close':
            gManager.destroy();
            gManager = null;
            break;

        default:
            sendError(message.id, `Unrecognized message type "${message.type}"`);
            break;
    }
};
