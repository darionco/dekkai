import {loadBlob} from './DataTools';

export class DataChunk {
    constructor(blob, rowOffsets, meta) {
        this.mBlob = blob;
        this.mBuffer = null;
        this.mView = null;

        this.mOffsets = new Uint32Array(rowOffsets);
        this.mMeta = meta;
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

    load() {
        if (this.loaded) {
            return Promise.resolve(this.mView);
        }
        return new Promise(resolve => {
            loadBlob(this.mBlob).then(buffer => {
                this.mBuffer = buffer;
                this.mView = new DataView(this.mBuffer);
                resolve(this.mView);
            });
        });
    }

    unload() {
        this.mBuffer = null;
        this.mView = null;
    }
}
