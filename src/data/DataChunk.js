import {WorkerPool} from '../workers/WorkerPool';

const ROW_HAS_DANGLING_QUALIFIERS = 1;
const ROW_MISMATCHED_COLUMN_COUNT = 2;
const ROW_MISMATCHED_QUALIFIERS = 4;

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

        this.mDecoder = new TextDecoder();

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

    get rowCount() {
        return this.mOffsets.length;
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
            this.mLoading = workerPool.scheduleTask('loadChunk', options).then(result => {
                this.mBuffer = result.buffer;
                this.mView = new DataView(this.mBuffer);
            });
        }
        return this.mLoading;
    }

    unload() {
        this.mBuffer = null;
        this.mView = null;
    }

    getRow(index, row = []) {
        row.length = 0;
        if (this.loaded && index < this.mRowLength) {
            const ptr = this.mRowLength * index;
            const state = this.mView.getUint32(ptr, true);

            if (state !== 0) {
                if (state & ROW_HAS_DANGLING_QUALIFIERS) {
                    console.warn('Row has dangling qualifiers'); // eslint-disable-line
                }

                if (state & ROW_MISMATCHED_COLUMN_COUNT) {
                    console.warn('Row has mismatched column count'); // eslint-disable-line
                }

                if (state & ROW_MISMATCHED_QUALIFIERS) {
                    console.warn('Row has mismatched qualifiers'); // eslint-disable-line
                }
            }

            let offset;
            let length;
            for (let i = 0; i < this.mColumnCount; ++i) {
                offset = ptr + this.mColumnOffsets[i];
                length = this.mView.getUint32(offset, true);
                row.push(this.mDecoder.decode(new Uint8Array(this.mBuffer, offset + 4, length)));
            }
        }
        return row;
    }
}
