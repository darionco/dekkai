import {defaultConfig, readHeader, sliceFile, analyzeBlobs} from '../data/DataTools';

const _TableImp = (function() {
    class Table {
        static async fromFile(file, configuration) {
            const config = Object.freeze(Object.assign({}, defaultConfig, configuration));
            const {header, offset} = await readHeader(file, config);
            const blobs = await sliceFile(file, offset, config);
            const analyzed = await analyzeBlobs(blobs, header, config);

            return new Table(header, analyzed.chunks, analyzed.meta, config);
        }

        static async fromURL(url, configuration) {
            const opts = Object.assign({}, defaultConfig, configuration);
            opts.toString();
        }

        constructor(header, chunks, meta, config) {
            this.mHeader = header;
            this.mChunks = chunks;
            this.mMeta = meta;
            this.mConfig = config;
            this.mRowsMap = this._generateRowsMap(this.mChunks);
            this.mLoadedChunks = [];
            this.mRegExp = new RegExp(`^${config.qualifier}(.+(?=${config.qualifier}$))${config.qualifier}$`);
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

        async getRow(i = 0) {
            const chunkIndex = this._getChunkForRow(i);
            const chunk = this.mChunks[chunkIndex];
            const rowIndex = chunkIndex === 0 ? i : i - this.mRowsMap[chunkIndex - 1];
            if (!chunk.loaded) {
                if (this.mLoadedChunks.length >= this.mConfig.maxLoadedChunks) {
                    this.mLoadedChunks.shift().unload();
                }
                await chunk.load(this.mConfig);
                this.mLoadedChunks.push(chunk);
            }

            return chunk.getRow(rowIndex);
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

        _getChunkForRow(index) {
            let i = Math.floor(this.mChunks.length * (index / this.rowCount));

            if (index < this.mRowsMap[i]) {
                if (i === 0 || index >= this.mRowsMap[i - 1]) {
                    return i;
                }
                while (i > 0 && index < this.mRowsMap[i - 1]) {
                    --i;
                }
                return i;
            }

            while (index >= this.mRowsMap[i]) {
                ++i;
            }
            return i;
        }
    }

    return Table;
})();

export class Table {
    static async fromFile(file, options = null) {
        return _TableImp.fromFile(file, options);
    }

    static async fromURL(url, options = null) {
        return _TableImp.fromURL(url, options);
    }

    constructor() {
        throw 'ERROR: Table constructor cannot be called directlyZ';
    }
}
