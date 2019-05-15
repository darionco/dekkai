import {Row} from './Row';

export class TableRow extends Row {
    constructor(table) {
        super();
        this.mTable = table;
        this.mChunkInfo = null;

        this._initializeColumnGetters();
    }

    get table() {
        return this.mTable;
    }

    get chunkInfo() {
        return this.mChunkInfo;
    }

    get columnNameToIndex() {
        return this.mTable.columnNameToIndex;
    }

    get columnTypes() {
        return this.mTable.columnTypes;
    }

    get header() {
        return this.mTable.header;
    }

    get decoder() {
        return this.mTable.decoder;
    }

    async setIndex(index) {
        if (index !== this.mIndex) {
            this.mIndex = index;
            if (!this.mChunkInfo || this.mIndex < this.mChunkInfo.start || this.mIndex >= this.mChunkInfo.end) {
                this.mChunkInfo = this._getChunkInfoForRow(this.mIndex);
                this.mChunk = this.mTable.chunks[this.mChunkInfo.index];
                await this.load();
            }

            // typedef struct
            // {
            //     uint32 columnCount;
            //     uint32 length;
            //     uint32 status;
            // }
            // ParserRowInfo;
            this.mRowOffset = this.mChunk.offsetList[this.mIndex - this.mChunkInfo.start] / 4;
            this.mRowColumnCount = this.mChunk.layout[this.mRowOffset];
            this.mRowStatus = this.mChunk.layout[this.mRowOffset + 2];
        }
        return this;
    }

    async load() {
        if (this.mChunk && !this.mChunk.loaded) {
            await this.mTable._loadChunk(this.mChunk);
        }
    }

    _getChunkInfoForRow(index) {
        let i = Math.floor(this.mTable.chunks.length * (index / this.mTable.rowCount));

        while (i < this.mTable.chunks.length && index >= this.mTable.rowMap[i]) {
            ++i;
        }

        while (i > 0 && index < this.mTable.rowMap[i - 1]) {
            --i;
        }

        return {
            index: i,
            start: i === 0 ? 0 : this.mTable.rowMap[i - 1],
            end: this.mTable.rowMap[i],
        };
    }
}
