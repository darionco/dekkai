import {CSVChunk} from './CSVChunk';

const kChunkSize = 1024 * 1024 * 2; // 2MB

export class CSVTable {
    constructor(file) {
        this.mFile = file;
        this.mChunks = [];
        this.mHeader = null;
        this.mLoaded = false;

        let offset = 0;
        while (offset < this.mFile.size) {
            this.mChunks.push(new CSVChunk(this.mFile.slice(offset, Math.min(offset + kChunkSize, this.mFile.size))));
            offset += kChunkSize;
        }
    }

    async initMetadata() {
        if (this.mHeader) {
            return this.mHeader;
        }

        this.mChunks[0].reset();

        const row = [];
        if (await this.mChunks[0].nextRow(row)) {
            throw 'Malformed CSV!';
        }

        this.mChunks[0].setFront();
        this.mHeader = row;
        return this.mHeader;
    }
}
