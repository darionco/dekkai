import {getDecoder} from '../data/Decoder';
import {Row} from './Row';

export class DataChunkRow extends Row {
    constructor(header, chunk, encoding = 'utf8') {
        super();
        this.mHeader = header;
        this.mChunk = chunk;
        this.mDecoder = getDecoder(encoding);
        this.mIndex = -1;
        this.mGetters = null;

        this.mRowOffset = 0;
        this.mRowColumnCount = 0;
        this.mRowStatus = 0;

        this.mColumnNameToIndex = {};

        for (let i = 0, n = this.mHeader.length; i < n; ++i) {
            const column = this.mHeader[i];
            this.mColumnNameToIndex[column.name] = i;
        }

        this._initializeColumnGetters();
    }

    get columnNameToIndex() {
        return this.mColumnNameToIndex;
    }

    get columnTypes() {
        throw 'ERROR: Not implemented';
    }

    get header() {
        return this.mHeader;
    }

    get decoder() {
        return this.mDecoder;
    }

    get chunk() {
        return this.mChunk;
    }

    set chunk(value) {
        if (value !== this.mChunk) {
            this.mChunk = value;
            this.setIndex(0);
        }
    }

    setIndex(index) {
        this.mIndex = index;
        this.mRowOffset = this.mChunk.offsetList[index] / 4;
        this.mRowColumnCount = this.mChunk.layout[this.mRowOffset];
        this.mRowStatus = this.mChunk.layout[this.mRowOffset + 2];
    }

    async load() { // eslint-disable-line
        if (this.mChunk.loading) {
            await this.mChunk.loading;
        } else {
            await this.mChunk.load();
        }
    }
}
