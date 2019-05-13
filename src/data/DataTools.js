import {WorkerPool} from '../workers/WorkerPool';
import {DataChunk} from './DataChunk';
import {DataChunkRow} from '../csv/DataChunkRow';

export const supportsSharedMemory = (function() {
    try {
        new SharedArrayBuffer(1); // eslint-disable-line
        return true;
    } catch (e) {
        return false;
    }
})();

export const sizeOf1KB = 1024;
export const sizeOf1MB = sizeOf1KB * 1024;

export const PARSING_MODE = {
    ANALYZE: 0,
    LOAD: 1,
    BINARY: 2,
};

export const defaultConfig = {
    separator: ',',
    qualifier: '"',
    linebreak: '\n',
    firstRowHeader: true,
    maxRowSize: sizeOf1KB * 128,
    chunkSize: sizeOf1MB * 4,
    maxLoadedChunks: 32,
    encoding: 'utf8',
};

export function combineTypedArrays(arrays) {
    const views = [];
    let length = 0;
    for (let i = 0; i < arrays.length; ++i) {
        if (arrays[i] instanceof Uint8Array) {
            views.push(arrays[i]);
        } else {
            views.push(new Uint8Array(arrays[i].buffer, arrays[i].byteOffset, arrays[i].byteLength));
        }
        length += arrays[i].byteLength;
    }

    const buffer = new ArrayBuffer(length);
    const view = new Uint8Array(buffer);

    let off = 0;
    for (let i = 0; i < views.length; ++i) {
        view.set(views[i], off);
        off += views[i].byteLength;
    }

    return buffer;
}

export function combineBuffers(buffers) {
    const views = [];
    let length = 0;
    for (let i = 0; i < buffers.length; ++i) {
        views.push(new Uint8Array(buffers[i]));
        length += buffers[i].byteLength;
    }

    const buffer = new ArrayBuffer(length);
    const view = new Uint8Array(buffer);

    let off = 0;
    for (let i = 0; i < views.length; ++i) {
        view.set(views[i], off);
        off += views[i].byteLength;
    }

    return buffer;
}

export function writeOptionsToBuffer(view, ptr, options) {
    let offset = 0;
    for (let i = 0, n = options.length; i < n; ++i) {
        view.setUint32(ptr + offset, options[i], true);
        offset += 4;
    }
    return offset;
}

export function loadBlob(blob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(blob);
    });
}

export function readRow(view, offset, result, config = defaultConfig) {
    const separator = config.separator.charCodeAt(0);
    const qualifier = config.qualifier.charCodeAt(0);
    const lineBreak = config.linebreak.charCodeAt(0);
    let fieldOffset = offset;
    let isInQuotes = false;
    let char;
    let i;
    for (i = offset; i < view.byteLength; ++i) {
        char = view.getUint8(i);
        if (char === qualifier) {
            if (!(i - fieldOffset) && !isInQuotes) {
                isInQuotes = true;
            } else if ((i - fieldOffset) && i + 1 < view.byteLength && view.getUint8(i + 1) === qualifier) {
                char = '"'.charCodeAt(0);
            } else if ((i - fieldOffset) && isInQuotes) {
                isInQuotes = false;
            } else {
                console.warn('WARNING: Malformed - found rogue qualifier'); // eslint-disable-line
            }
        } else if (char === separator && !isInQuotes) {
            result.push(new Uint8Array(view.buffer, fieldOffset, i - fieldOffset));
            fieldOffset = i + 1;
        } else if (char === lineBreak && !isInQuotes) {
            if (isInQuotes) {
                console.warn('WARNING: Malformed - qualifier field unterminated'); // eslint-disable-line
                isInQuotes = false;
            }

            result.push(new Uint8Array(view.buffer, fieldOffset, i - fieldOffset));
            return i + 1;
        }
    }

    if (i > fieldOffset) {
        result.push(new Uint8Array(view.buffer, fieldOffset, i - fieldOffset));
    }
    return i;
}

export async function readHeader(file, config = defaultConfig) {
    const chunk = file.slice(0, Math.min(config.maxRowSize, file.size));
    const buffer = await chunk.load();

    const view = new DataView(buffer);
    const columns = [];
    const offset = readRow(view, 0, columns, config);
    const header = [];

    const rx = new RegExp(`^${config.qualifier}(.+(?=${config.qualifier}$))${config.qualifier}$`);
    for (let i = 0; i < columns.length; ++i) {
        const cleanValue = String.fromCharCode(...columns[i]).trim().replace(rx, '$1');
        header.push({
            name: config.firstRowHeader ? cleanValue : `Column${i}`,
            minLength: Number.MAX_SAFE_INTEGER,
            maxLength: Number.MIN_SAFE_INTEGER,
            emptyCount: 0,
            stringCount: 0,
            intCount: 0,
            floatCount: 0,
        });
    }

    return {
        header,
        offset: config.firstRowHeader ? offset : 0,
    };
}

export async function sliceFile(file, start, config = defaultConfig) {
    const workerPool = WorkerPool.sharedInstance;
    const chunkSize = config.chunkSize;

    const promises = [];
    const offsets = [];
    let offset = start;
    while (offset < file.size) {
        offsets.push({
            start: offset,
            end: Math.min(offset + chunkSize, file.size),
        });
        offset += chunkSize;
    }

    const optionsBase = {
        linebreak: config.linebreak.charCodeAt(0),
        maxRowSize: config.maxRowSize,
        file,
    };

    for (let i = 0, n = offsets.length - 1; i < n; ++i) {
        const options = Object.assign({}, offsets[i], optionsBase, {
            index: i,
        });
        promises.push(workerPool.scheduleTask('calculateOffsets', options));
    }

    const results = await Promise.all(promises);
    const blobs = [];
    let i;
    for (i = 0; i < results.length; ++i) {
        offsets[results[i].index].end += results[i].offset;
        offsets[results[i].index + 1].start += results[i].offset;
    }

    for (i = 0; i < offsets.length; ++i) {
        blobs.push(file.slice(offsets[i].start, offsets[i].end));
    }

    return blobs;
}

export async function analyzeBlobs(blobs, header, config = defaultConfig) {
    const workerPool = WorkerPool.sharedInstance;
    const promises = [];
    const optionsBase = {
        linebreak: config.linebreak.charCodeAt(0),
        separator: config.separator.charCodeAt(0),
        qualifier: config.qualifier.charCodeAt(0),
        columnCount: header.length,
        mode: PARSING_MODE.ANALYZE,
    };
    for (let i = 0, n = blobs.length; i < n; ++i) {
        const options = Object.assign({}, optionsBase, {
            blob: blobs[i],
            index: i,
        });
        promises.push(workerPool.scheduleTask('parseBlob', options));
    }

    const results = await Promise.all(promises);
    const chunks = new Array(blobs.length);
    const aggregated = {
        rowCount: 0,
        malformedRows: 0,
    };

    for (let i = 0; i < results.length; ++i) {
        chunks[results[i].index] = new DataChunk(blobs[results[i].index], header.length, results[i].stats.rowCount, config);
        aggregated.rowCount += results[i].stats.rowCount;
        aggregated.malformedRows += results[i].stats.malformedRows;

        const metaView = new Uint32Array(results[i].columns);
        for (let ii = 0, mi = 0; ii < header.length; ++ii, mi += 6) {
            header[ii].minLength = Math.min(header[ii].minLength, metaView[mi]);
            header[ii].maxLength = Math.max(header[ii].maxLength, metaView[mi + 1]);

            header[ii].intCount += metaView[mi + 2];
            header[ii].floatCount += metaView[mi + 3];
            header[ii].stringCount += metaView[mi + 4];
            header[ii].emptyCount += metaView[mi + 5];
        }
    }

    return {
        chunks,
        meta: aggregated,
    };
}

export async function iterateBlobs(blobs, header, itr, config = defaultConfig) {
    const workerPool = WorkerPool.sharedInstance;
    const tasks = [];

    const optionsBase = {
        linebreak: config.linebreak.charCodeAt(0),
        separator: config.separator.charCodeAt(0),
        qualifier: config.qualifier.charCodeAt(0),
        columnCount: header.length,
        mode: PARSING_MODE.LOAD,
    };

    for (let i = 0, n = blobs.length; i < n; ++i) {
        const options = Object.assign({}, optionsBase, {
            blob: blobs[i],
            index: i,
        });
        tasks.push(options);
    }

    return await new Promise(resolve => {
        const row = new DataChunkRow(header, null, config.encoding);
        const results = {};
        let blobIndex = 0;
        let index = 0;
        const invokeIterator = async result => {
            const chunk = DataChunk.fromLoadResult(result);
            row.chunk = chunk;
            for (let i = 0; i < chunk.rowCount; ++i) {
                await row.setIndex(i);
                itr(row, index++);
            }
            chunk.unload();

            if (blobIndex >= blobs.length - 1) {
                resolve();
            }
        };

        const handleResult = async result => {
            if (result.index === blobIndex) {
                await invokeIterator(result);
                if (tasks.length) {
                    workerPool.scheduleTask('parseBlob', tasks.shift()).then(handleResult);
                }
                while (results.hasOwnProperty(++blobIndex)) {
                    await invokeIterator(results[blobIndex]);
                    delete results[blobIndex];
                    if (tasks.length) {
                        workerPool.scheduleTask('parseBlob', tasks.shift()).then(handleResult);
                    }
                }
            } else {
                results[result.index] = result;
            }
        };

        for (let i = 0; i < workerPool.workers.length; ++i) {
            workerPool.scheduleTask('parseBlob', tasks.shift()).then(handleResult);
        }
    });
}

export async function binaryFromBlobs(blobs, header, config = defaultConfig) {
    const workerPool = WorkerPool.sharedInstance;
    const promises = [];
    const optionsBase = {
        linebreak: config.linebreak.charCodeAt(0),
        separator: config.separator.charCodeAt(0),
        qualifier: config.qualifier.charCodeAt(0),
        columnCount: header.length,
        mode: PARSING_MODE.BINARY,
    };
    for (let i = 0, n = blobs.length; i < n; ++i) {
        const options = Object.assign({}, optionsBase, {
            blob: blobs[i],
            index: i,
        });
        promises.push(workerPool.scheduleTask('parseBlob', options));
    }

    const results = await Promise.all(promises);
    const binaryHeader = {
        columns: [],
        names: {},
        rowCount: 0,
        rowLength: 0,
        dataLength: 0,
    };

    for (let i = 0; i < header.length; ++i) {
        binaryHeader.names[header[i].name] = binaryHeader.columns.length;
        binaryHeader.columns.push({
            name: header[i].name,
            length: 0,
            offset: 0,
            type: results[0].header.types[i],
        });
    }

    const orderedResults = [];
    const transferable = [];
    for (let i = 0; i < results.length; ++i) {
        binaryHeader.rowCount += results[i].header.rowCount;
        for (let ii = 0; ii < header.length; ++ii) {
            binaryHeader.columns[ii].length = Math.max(binaryHeader.columns[ii].length, results[i].header.lengths[ii]);
        }
        orderedResults[results[i].index] = results[i];
        transferable[results[i].index] = results[i].data;
    }

    let offset = 0;
    for (let i = 0; i < header.length; ++i) {
        binaryHeader.columns[results[0].header.order[i]].offset = offset;
        offset += binaryHeader.columns[results[0].header.order[i]].length;
    }
    binaryHeader.rowLength = offset;
    binaryHeader.dataLength = offset * binaryHeader.rowCount;

    let dataOffset = 0;
    let buffer;
    if (config.output && config.output.buffer) {
        buffer = config.output.buffer;
        if (config.output.offset) {
            dataOffset = config.output.offset;
        }
    } else {
        if (supportsSharedMemory) {
            buffer = new SharedArrayBuffer(binaryHeader.dataLength); // eslint-disable-line
        } else {
            buffer = new ArrayBuffer(binaryHeader.dataLength);
        }
    }

    if (supportsSharedMemory && buffer instanceof SharedArrayBuffer) { // eslint-disable-line
        promises.length = 0;
        for (let i = 0; i < orderedResults.length; ++i) {
            promises.push(workerPool.scheduleTask('mergeIntoBuffer', {
                buffer,
                binaryHeader,
                dataOffset,
                parsed: orderedResults[i],
            }), [ orderedResults[i].data ]);

            dataOffset += orderedResults[i].header.rowCount * binaryHeader.rowLength;
        }
        await Promise.all(promises);
    } else {
        transferable.push(buffer);
        buffer = await workerPool.scheduleTask('mergeParsedResults', {
            buffer,
            binaryHeader,
            dataOffset,
            parsed: orderedResults,
        }, transferable);
    }

    return {
        header: binaryHeader,
        data: buffer,
    };
}

export function utf8ToStr(view, offset, length) {
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

export function utf16ToStr(view, offset, length) {
    let result = '';
    for (let i = 0; i < length; ++i) {
        result += String.fromCharCode(view.getUint8(offset + i));
    }
    return result;
}

export function getDecoder(encoding) {
    const lc = encoding.toLowerCase();
    switch (lc) {
        case 'unicode-1-1-utf-8':
        case 'utf-8':
        case 'utf8':
            return utf8ToStr;

        case 'utf-16':
        case 'utf16':
        case 'utf-16le':
            return utf16ToStr;

        default: {
            const decoder = new TextDecoder(lc);
            return (view, offset, length) => decoder.decode(new Uint8Array(view.buffer, offset, length));
        }
    }
}
