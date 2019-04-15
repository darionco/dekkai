export const RowError = {
    ROW_HAS_DANGLING_QUALIFIERS: 1,
    ROW_MISMATCHED_COLUMN_COUNT: 2,
    ROW_MISMATCHED_QUALIFIERS: 4,
};

export class Row extends Array {
    constructor(table) {
        super();
        this.mTable = table;
        this.mIndex = -1;
        this.mChunkInfo = null;
        this.mChunk = null;
        this.mRowOffset = 0;
        this.mGetters = null;
    }

    get table() {
        return this.mTable;
    }

    get chunkInfo() {
        return this.mChunkInfo;
    }

    get status() {
        if (this.mChunk.loaded) {
            return this.mChunk.view.getUint32(this.mRowOffset, true);
        }
        return 0;
    }

    get hasDanglingQualifiers() {
        return Boolean(this.status & RowError.ROW_HAS_DANGLING_QUALIFIERS);
    }

    get mismatchedColumnCount() {
        return Boolean(this.status & RowError.ROW_MISMATCHED_COLUMN_COUNT);
    }

    get mismatchedQualifiers() {
        return Boolean(this.status & RowError.ROW_MISMATCHED_QUALIFIERS);
    }

    get index() {
        return this.mIndex;
    }

    async setIndex(index) {
        if (index !== this.mIndex) {
            this.mIndex = index;
            if (!this.mChunkInfo || this.mIndex < this.mChunkInfo.start || this.mIndex >= this.mChunkInfo.end) {
                this.mChunkInfo = this._getChunkInfoForRow(this.mIndex);
                this.mChunk = this.mTable.chunks[this.mChunkInfo.index];
                this._initializeColumnGetters();
                await this.load();
            }
            this.mRowOffset = this.mChunk.rowLength * (this.mIndex - this.mChunkInfo.start);
        }
        return this;
    }

    async load() {
        if (this.mChunk && !this.mChunk.loaded) {
            await this.mTable._loadChunk(this.mChunk);
        }
    }

    value(column, typed = false) {
        if (this.mTable.columnNameToIndex.hasOwnProperty(column)) {
            return typed ? this.valueByNameTyped(column) : this.valueByName(column);
        }

        const int = parseInt(column, 10);
        if (!isNaN(int) && int < this.mTable.header.length) {
            return typed ? this.valueByIndexTyped(int) : this.valueByIndex(int);
        }

        return null;
    }

    valueByIndex(index) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[index].str();
    }

    valueByIndexTyped(index) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[index].typed();
    }

    valueByName(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[this.mTable.columnNameToIndex[name]].str();
    }

    valueByNameTyped(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[this.mTable.columnNameToIndex[name]].typed();
    }

    forEach(itr) {
        for (let i = 0, n = this.mTable.header.length; i < n; ++i) {
            itr(this.valueByIndex(i), i, this.mTable.header[i].name);
        }
    }

    forEachTyped(itr) {
        for (let i = 0, n = this.mTable.header.length; i < n; ++i) {
            itr(this.valueByIndexTyped(i), i, this.mTable.header[i].name);
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

    _initializeColumnGetters() {
        this.mGetters = [];

        for (let i = 0, n = this.mTable.header.length; i < n; ++i) {
            const offset = this.mChunk.columnOffsets[i];
            let length;
            let decoder = this.mTable.decoder;
            const getBuffer = () => {
                length = this.mChunk.view.getUint32(this.mRowOffset + offset, true);
                return decoder(this.mChunk.view, this.mRowOffset + offset + 4, length);
            };
            let index = i;
            this.mGetters.push({
                str: getBuffer,
                typed: () => this.mTable.columnTypes[index].convert(getBuffer()),
            });
        }
    }
}
