export const RowStatus = {
    ROW_STATUS_OK: 0,
    ROW_STATUS_DANGLING_QUALIFIER: 1,
    ROW_STATUS_COLUMN_MISMATCH: 2,
    ROW_STATUS_CELL_PARSING_FAILED: 4,
};

export class Row {
    static get states() {
        return RowStatus;
    }

    constructor() {
        this.mIndex = -1;
        this.mChunk = null;
        this.mGetters = null;

        this.mRowOffset = 0;
        this.mRowColumnCount = 0;
        this.mRowStatus = RowStatus.ROW_STATUS_OK;
    }

    get status() {
        return this.mRowStatus;
    }

    get statusDanglingQualifier() {
        return this.hasStatus(RowStatus.ROW_STATUS_DANGLING_QUALIFIER);
    }

    get statusColumnMismatch() {
        return this.hasStatus(RowStatus.ROW_STATUS_COLUMN_MISMATCH);
    }

    get statusCellParsingFailed() {
        return this.hasStatus(RowStatus.ROW_STATUS_CELL_PARSING_FAILED);
    }

    get index() {
        return this.mIndex;
    }

    get columnNameToIndex() {
        throw 'ERROR: Not implemented';
    }

    get columnTypes() {
        throw 'ERROR: Not implemented';
    }

    get header() {
        throw 'ERROR: Not implemented';
    }

    get decoder() {
        throw 'ERROR: Not implemented';
    }

    hasStatus(rowStatus) {
        return Boolean(this.status & rowStatus);
    }

    async setIndex(index) { // eslint-disable-line
        throw 'ERROR: Not implemented';
    }

    async load() { // eslint-disable-line
        throw 'ERROR: Not implemented';
    }

    value(column, typed = false) {
        if (this.columnNameToIndex.hasOwnProperty(column)) {
            return typed ? this.valueByNameTyped(column) : this.valueByName(column);
        }

        const int = parseInt(column, 10);
        if (!isNaN(int) && int < this.header.length) {
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

    valueByIndexAsInt(index) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return parseInt(this.mGetters[index].str(), 10);
    }

    valueByIndexAsFloat(index) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return parseFloat(this.mGetters[index].str());
    }

    valueByName(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[this.columnNameToIndex[name]].str();
    }

    valueByNameTyped(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return this.mGetters[this.columnNameToIndex[name]].typed();
    }

    valueByNameAsInt(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return parseInt(this.mGetters[this.columnNameToIndex[name]].str(), 10);
    }

    valueByNameAsFloat(name) {
        if (!this.mChunk || !this.mChunk.loaded) {
            return null;
        }
        return parseFloat(this.mGetters[this.columnNameToIndex[name]].str());
    }

    forEach(itr) {
        for (let i = 0, n = this.header.length; i < n; ++i) {
            itr(this.valueByIndex(i), i, this.header[i].name);
        }
    }

    forEachTyped(itr) {
        for (let i = 0, n = this.header.length; i < n; ++i) {
            itr(this.valueByIndexTyped(i), i, this.header[i].name);
        }
    }

    _initializeColumnGetters() {
        this.mGetters = [];
        for (let i = 0, n = this.header.length; i < n; ++i) {
            const offset = 3 + 3 * i;
            let decoder = this.decoder;
            let dataPtr;
            let dataLength;

            // typedef struct
            // {
            //     byte *start;
            //     uint32 length;
            //     DataType type;
            // }
            // ParserCellInfo;
            const getBuffer = () => {
                if (i < this.mRowColumnCount) {
                    dataPtr = this.mChunk.layout[this.mRowOffset + offset];
                    dataLength = this.mChunk.layout[this.mRowOffset + offset + 1];
                    return decoder(this.mChunk.view, this.mChunk.dataOffset + dataPtr, dataLength);
                }
                return '';
            };
            let index = i;
            this.mGetters.push({
                str: getBuffer,
                typed: () => this.columnTypes[index].convert(getBuffer()),
            });
        }
    }
}
