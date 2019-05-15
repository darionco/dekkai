import {DataFile} from '../data/DataFile';
import {binaryFromBlobs, defaultConfig, readHeader, sliceFile} from '../data/DataTools';
import {getDecoder} from '../data/Decoder';
import {BinaryRow} from './BinaryRow';

export class BinaryTable {
    static async fromFile(file, configuration = null) {
        const dataFile = new DataFile(file);
        const config = Object.freeze(Object.assign({}, defaultConfig, configuration));
        const {header, offset} = await readHeader(dataFile, config);
        const blobs = await sliceFile(dataFile, offset, config);
        const binary = await binaryFromBlobs(blobs, header, config);

        return new BinaryTable(binary.header, binary.data, config);
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

    constructor(header, buffer, config) {
        this.mHeader = header;
        this.mBuffer = buffer;
        this.mConfig = config;
        this.mView = new DataView(this.mBuffer);
        this.mDecoder = getDecoder(this.mConfig.encoding);
        this.mColumnTypes = [];
        this.mMeta = {
            rowCount: this.mHeader.rowCount,
            malformedRows: 0,
        };

        for (let i = 0; i < this.mHeader.columns.length; ++i) {
            switch (this.mHeader.columns[i].type) {
                case 0:
                    this.mColumnTypes.push({
                        bin: 0,
                        name: 'string',
                    });
                    break;

                case 1:
                    this.mColumnTypes.push({
                        bin: 1,
                        name: 'int',
                    });
                    break;

                case 2:
                    this.mColumnTypes.push({
                        bin: 2,
                        name: 'float',
                    });
                    break;

                default:
                    throw `ERROR: Unknown bin type (${this.mHeader.columns[i].type})`;
            }
        }
    }

    get buffer() {
        return this.mBuffer;
    }

    get view() {
        return this.mView;
    }

    get rowCount() {
        return this.mHeader.rowCount;
    }

    get config() {
        return this.mConfig;
    }

    get header() {
        return this.mHeader;
    }

    get meta() {
        return this.mMeta;
    }

    get columnTypes() {
        return this.mColumnTypes;
    }

    get columnNameToIndex() {
        return this.mHeader.names;
    }

    get decoder() {
        return this.mDecoder;
    }

    getRow(i = 0) {
        const row = new BinaryRow(this);
        return row.setIndex(i);
    }

    forEach(itr) {
        const row = new BinaryRow(this);
        for (let i = 0, n = this.rowCount; i < n; ++i) {
            row.setIndex(i);
            itr(row, i);
        }
    }
}
