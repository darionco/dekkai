import {WorkerPool} from '../workers/WorkerPool';

export class DataChunk {
    constructor(blob, rowOffsets, meta) {
        this.mBlob = blob;
        this.mBuffer = null;
        this.mView = null;

        this.mOffsets = new Uint32Array(rowOffsets);
        this.mMeta = meta;

        this.mLoading = null;

        this.mRowLength = 4;
        this.mColumnOffsets = [];
        this.mColumnLengths = [];
        this.mColumnCount = Math.floor(this.mMeta.byteLength / 24);

        const metaView = new DataView(this.mMeta);
        let length;
        for (let i = 0; i < this.mColumnCount; ++i) {
            this.mColumnOffsets.push(this.mRowLength);
            length = Math.ceil(metaView.getInt32(4 + 24 * i, true) / 4) * 4;
            this.mColumnLengths.push(length);
            this.mRowLength += length + 4;
        }
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

    get loaded() {
        return this.mBuffer !== null;
    }

    get loading() {
        return this.mLoading;
    }

    get columnCount() {
        return this.mColumnCount;
    }

    get columnOffsets() {
        return this.mColumnOffsets;
    }

    get rowCount() {
        return this.mOffsets.length;
    }

    get rowLength() {
        return this.mRowLength;
    }

    get offsets() {
        return this.mOffsets;
    }

    get meta() {
        return this.mMeta;
    }

    load(config) {
        if (!this.mLoading) {
            const workerPool = WorkerPool.sharedInstance;
            const options = {
                blob: this.mBlob,

                columnLengths: this.mColumnLengths,
                columnOffsets: this.mColumnOffsets,
                columnCount: this.mColumnCount,

                rowLength: this.mRowLength,
                rowCount: this.rowCount,

                linebreak: config.linebreak.charCodeAt(0),
                separator: config.separator.charCodeAt(0),
                qualifier: config.qualifier.charCodeAt(0),
            };
            const loading = workerPool.scheduleTask('loadChunk', options).then(result => {
                if (this.mLoading === loading) {
                    this.mBuffer = result.buffer;
                    this.mView = new DataView(this.mBuffer);
                }
                return this;
            });
            this.mLoading = loading;
        }
        return this.mLoading;
    }

    unload() {
        this.mBuffer = null;
        this.mView = null;
        this.mLoading = null;
    }
}
