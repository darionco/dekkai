import {Row} from './Row';

export class BinaryRow extends Row {
    constructor(table) {
        super();
        this.mTable = table;
        this.mChunk = { loaded: true };

        this._initializeColumnGetters();
    }

    get table() {
        return this.mTable;
    }

    get columnNameToIndex() {
        return this.mTable.columnNameToIndex;
    }

    get columnTypes() {
        return this.mTable.columnTypes;
    }

    get header() {
        return this.mTable.header.columns;
    }

    get decoder() {
        return this.mTable.decoder;
    }

    setIndex(index) { // eslint-disable-line
        this.mRowOffset = this.mTable.header.rowLength * index;
        return this;
    }

    async load() { // eslint-disable-line
        return true;
    }

    _initializeColumnGetters() {
        this.mGetters = [];
        for (let i = 0, n = this.header.length; i < n; ++i) {
            const offset = this.header[i].offset;

            let getData;

            switch (this.header[i].type) {
                case 0: {
                    const decoder = this.decoder;
                    let dataLength;
                    getData = () => {
                        dataLength = this.mTable.view.getUint8(this.mRowOffset + offset);
                        return decoder(this.mTable.view, this.mRowOffset + offset + 1, dataLength);
                    };
                }
                    break;

                case 1:
                    getData = () => this.mTable.view.getInt32(this.mRowOffset + offset, true);
                    break;

                case 2:
                    getData = () => this.mTable.view.getFloat32(this.mRowOffset + offset, true);
                    break;

                default:
                    throw `ERROR: Unknown bin type (${this.header[i].type})`;
            }

            this.mGetters.push({
                str: getData,
                typed: getData,
            });
        }
    }
}
