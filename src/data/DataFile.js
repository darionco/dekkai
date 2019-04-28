import {loadBlob} from './DataTools';

/* handle running in node.js */
const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
const kRequire = kIsNodeJS ? module.require : null; // eslint-disable-line
const fs = kIsNodeJS ? kRequire('fs') : null; // eslint-disable-line

class NodeChunk {
    constructor(file, start, end) {
        this.mFile = file;
        this.mStart = start;
        this.mEnd = end;
    }

    load() {
        return new Promise((resolve, reject) => {
            const length = this.mEnd - this.mStart;
            const arr = new Uint8Array(length);
            fs.read(this.mFile, arr, 0, length, this.mStart, (err, bytesRead) => {
                if (err || bytesRead !== length) {
                    reject(err);
                } else {
                    resolve(arr.buffer);
                }
            });
        });
    }
}

class WebChunk {
    constructor(blob) {
        this.mBlob = blob;
    }

    load() {
        return loadBlob(this.mBlob);
    }
}

export class DataFile {
    static deserialize(description) {
        const result = Object.create(this.prototype);
        return Object.assign(result, description);
    }

    static deserializeBlob(blob) {
        if (kIsNodeJS) {
            return new NodeChunk(blob.mFile, blob.mStart, blob.mEnd);
        }
        return new WebChunk(blob.mBlob);
    }

    constructor(file) {
        this.mFile = file;
        this.mByteLength = 0;

        if (kIsNodeJS) {
            const stat = fs.fstatSync(this.mFile);
            this.mByteLength = stat.size;
        } else {
            this.mByteLength = this.mFile.size;
        }
    }

    get byteLength() {
        return this.mByteLength;
    }

    get size() {
        return this.mByteLength;
    }

    slice(start, end) {
        if (kIsNodeJS) {
            return new NodeChunk(this.mFile, start, end);
        }

        const blob = this.mFile.slice(start, end);
        return new WebChunk(blob);
    }
}
