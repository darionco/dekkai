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
            const getBuffer = () => {
                length = this.mChunk.view.getUint32(this.mRowOffset + offset, true);
                return this._utf8ToStr(this.mChunk.view, this.mRowOffset + offset + 4, length);
            };
            let index = i;
            this.mGetters.push({
                str: getBuffer,
                typed: () => this.mTable.columnTypes[index].convert(getBuffer()),
            });
        }
    }

    _utf8ToStr(view, offset, length) {
        let result = '';
        let c;
        for (let i = 0; i < length; ++i) {
            c = view.getUint8(offset + i);
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    result += String.fromCharCode(c);
                    break;

                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    result += String.fromCharCode(
                        ((c & 0x1F) << 6) |
                        (view.getUint8(offset + (++i)) & 0x3F)
                    );
                    break;

                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    result += String.fromCharCode(
                        ((c & 0x0F)) << 12 |
                        ((view.getUint8(offset + (++i)) & 0x3F) << 6) |
                        (view.getUint8(offset + (++i)) & 0x3F)
                    );
                    break;

                case 15:
                    // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
                    result += String.fromCodePoint(
                        ((c & 0x07) << 18) |
                        ((view.getUint8(offset + (++i)) & 0x3F) << 12) |
                        ((view.getUint8(offset + (++i)) & 0x3F) << 6) |
                        (view.getUint8(offset + (++i)) & 0x3F));
                    break;


                default:
                    break;
            }
        }
        return result;
    }
}
