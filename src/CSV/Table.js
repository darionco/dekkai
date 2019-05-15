import {defaultConfig, readHeader, sliceFile, analyzeBlobs, getDecoder} from '../data/DataTools';
import {DataFile} from '../data/DataFile';
import {TableRow} from './TableRow';

const kStringType = {
    bin: 0,
    name: 'string',
    convert: str => str,
};

const kFloatType = {
    bin: 1,
    name: 'float',
    convert: str => parseFloat(str),
};

const kIntType = {
    bin: 2,
    name: 'int',
    convert: str => parseInt(str, 10),
};

const kTypes = {
    'string': kStringType,
    'float': kFloatType,
    'int': kIntType,
};

export class Table {
    static async fromFile(file, configuration = null) {
        const dataFile = new DataFile(file);
        const config = Object.freeze(Object.assign({}, defaultConfig, configuration));
        const {header, offset} = await readHeader(dataFile, config);
        const blobs = await sliceFile(dataFile, offset, config);
        const analyzed = await analyzeBlobs(blobs, header, config);

        return new Table(header, analyzed.chunks, analyzed.meta, config);
    }

    static async fromURL(url, configuration = null) {
        const opts = Object.assign({}, defaultConfig, configuration);
        opts.toString();
        throw 'Not implemented yet';
    }

    static async fromString(str, configuration = null) {
        const blob = new Blob([str]);
        return await this.fromFile(blob, configuration);
    }

    constructor(header, chunks, meta, config) {
        this.mHeader = header;
        this.mChunks = chunks;
        this.mMeta = meta;
        this.mConfig = config;
        this.mRowMap = this._generateRowsMap(this.mChunks);
        this.mLoadedChunks = [];
        this.mColumnTypes = [];
        this.mColumnNameToIndex = {};
        this.mDecoder = getDecoder(this.mConfig.encoding);

        for (let i = 0, n = this.mHeader.length; i < n; ++i) {
            const column = this.mHeader[i];
            this.mColumnNameToIndex[column.name] = i;
            this.setColumnType(i);
        }
    }

    get rowCount() {
        return this.mMeta.rowCount;
    }

    get meta() {
        return this.mMeta;
    }

    get config() {
        return this.mConfig;
    }

    get header() {
        return this.mHeader;
    }

    get chunks() {
        return this.mChunks;
    }

    get rowMap() {
        return this.mRowMap;
    }

    get columnTypes() {
        return this.mColumnTypes;
    }

    get columnNameToIndex() {
        return this.mColumnNameToIndex;
    }

    get decoder() {
        return this.mDecoder;
    }

    setColumnType(column, type = null) {
        if (type !== null && !kTypes.hasOwnProperty(type)) {
            throw `Unknown type ${type}`;
        }

        let index;
        if (this.mColumnNameToIndex.hasOwnProperty(column)) {
            index = this.mColumnNameToIndex[column];
        } else {
            index = parseInt(column, 10);
            if (isNaN(index) || index < 0 || index >= this.mHeader.length) {
                throw `Unknown column: ${column}`;
            }
        }

        if (type === null) {
            const col = this.mHeader[index];
            const rowCount = this.rowCount - col.emptyCount;
            if (col.stringCount > col.intCount + col.floatCount) {
                this.mColumnTypes.push(Object.assign({}, kStringType, {
                    certainty: col.stringCount / rowCount,
                }));
            } else if (col.floatCount !== 0) {
                this.mColumnTypes.push(Object.assign({}, kFloatType, {
                    certainty: (col.floatCount + col.intCount) / rowCount,
                }));
            } else {
                this.mColumnTypes.push(Object.assign({}, kIntType, {
                    certainty: col.intCount / rowCount,
                }));
            }
        } else {
            this.mColumnTypes[index] = Object.assign({}, kTypes[type], {
                certainty: 1.0,
            });
        }
    }

    async getRow(i = 0) {
        const row = new TableRow(this);
        return await row.setIndex(i);
    }

    async forEach(itr) {
        const row = new TableRow(this);
        const chunkCount = this.mChunks.length;
        const loading = [];
        let loadIndex;
        for (loadIndex = 0; loadIndex < this.mConfig.maxLoadedChunks && loadIndex < chunkCount; ++loadIndex) {
            loading.push(this._loadChunk(this.mChunks[loadIndex]));
        }

        for (let i = 0, n = this.rowCount; i < n; ++i) {
            if (row.chunkInfo && i >= row.chunkInfo.end && loadIndex < chunkCount) {
                this._loadChunk(this.mChunks[loadIndex++]);
            }
            await row.setIndex(i);
            itr(row, i);
        }
    }

    async _loadChunk(chunk) {
        if (chunk.loading) {
            return await chunk.loading;
        }

        if (this.mLoadedChunks.length >= this.mConfig.maxLoadedChunks) {
            this.mLoadedChunks.shift().unload();
        }
        this.mLoadedChunks.push(chunk);
        return await chunk.load(this.mConfig);
    }

    _generateRowsMap(chunks) {
        const result = [];
        let count = 0;
        for (let i = 0; i < chunks.length; ++i) {
            count += chunks[i].rowCount;
            result.push(count);
        }
        return result;
    }

    _binaryColumnTypes() {
        return this.mColumnTypes.map(type => type.bin);
    }

    _binaryLengths() {
        const result = {
            columnLengths: [],
            columnOffsets: [],
            rowLength: 0,
        };

        let size;
        for (let i = 0, n = this.mColumnTypes.length; i < n; ++i) {
            if (this.mColumnTypes[i].bin === kStringType.bin) {
                size = (Math.min(this.mHeader[i].maxLength, 255) + 4) & ~0x03;
            } else {
                size = 4;
            }
            result.columnLengths.push(size);
            result.columnOffsets.push(result.rowLength);
            result.rowLength += size;
        }

        return result;
    }
}
