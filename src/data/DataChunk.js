import {WorkerPool} from '../workers/WorkerPool';
import {PARSING_MODE} from './DataTools';

export class DataChunk {
    static fromLoadResult(result) {
        const ret = new DataChunk(null, 0, result.stats.rowCount);
        ret._handleLoadResult(result);
        ret.mLoading = Promise.resolve(result);
        return ret;
    }

    constructor(blob, columnCount, rowCount, config) {
        this.mBlob = blob;
        this.mColumnCount = columnCount;
        this.mRowCount = rowCount;
        this.mConfig = Object.assign({}, config);
        this.mBuffer = null;
        this.mView = null;

        this.mOffsetList = null;
        this.mLayout = null;
        this.mDataOffset = 0;

        this.mLoading = null;
    }

    get blob() {
        return this.mBlob;
    }

    get buffer() {
        return this.mBuffer;
    }

    get view() {
        return this.mView;
    }

    get offsetList() {
        return this.mOffsetList;
    }

    get layout() {
        return this.mLayout;
    }

    get dataOffset() {
        return this.mDataOffset;
    }

    get loaded() {
        return this.mBuffer !== null;
    }

    get loading() {
        return this.mLoading;
    }

    get rowCount() {
        return this.mRowCount;
    }

    load() {
        if (!this.mLoading) {
            const workerPool = WorkerPool.sharedInstance;
            const options = {
                linebreak: this.mConfig.linebreak.charCodeAt(0),
                separator: this.mConfig.separator.charCodeAt(0),
                qualifier: this.mConfig.qualifier.charCodeAt(0),
                columnCount: this.mColumnCount,
                mode: PARSING_MODE.LOAD,
                blob: this.mBlob,
                index: 0,
            };
            const loading = workerPool.scheduleTask('parseBlob', options).then(result => {
                if (this.mLoading === loading) {
                    this._handleLoadResult(result);
                }
                return this;
            });
            this.mLoading = loading;
        }
        return this.mLoading;
    }

    toBinary(config) {
        const workerPool = WorkerPool.sharedInstance;
        const options = {
            blob: this.mBlob,

            columnLengths: config.columnLengths,
            columnOffsets: config.columnOffsets,
            columnTypes: config.columnTypes,
            columnCount: config.columnCount,

            rowLength: config.rowLength,
            rowCount: this.rowCount,

            linebreak: config.linebreak.charCodeAt(0),
            separator: config.separator.charCodeAt(0),
            qualifier: config.qualifier.charCodeAt(0),
        };

        const promises = [];

        const promise = workerPool.scheduleTask('convertToBinary', options).then(result => {
            console.log(result);
        });
        promises.push(promise);

        return Promise.all(promises);
    }

    unload() {
        this.mBuffer = null;
        this.mView = null;
        this.mLoading = null;
        this.mOffsetList = null;
        this.mLayout = null;
        this.mData = null;
    }

    _handleLoadResult(result) {
        this.mBuffer = result.buffer;
        this.mView = new DataView(this.mBuffer);
        this.mOffsetList = new Uint32Array(this.mBuffer, result.header.offsetList.ptr, result.header.offsetList.length / 4);
        this.mLayout = new Uint32Array(this.mBuffer, result.header.layout.ptr, result.header.layout.length / 4);
        this.mDataOffset = result.header.data.ptr;
    }
}
