import {WorkerPool} from '../workers/WorkerPool';
import {DataChunk} from './DataChunk';

export const sizeOf1KB = 1024;
export const sizeOf1MB = sizeOf1KB * 1024;

export const defaultConfig = {
    separator: ',',
    qualifier: '"',
    linebreak: '\n',
    firstRowHeader: true,
    maxRowSize: sizeOf1KB * 128,
    chunkSize: sizeOf1MB * 4,
    maxLoadedChunks: 4,
    encoding: 'utf8',
};

export function writeOptionsToBuffer(view, ptr, options) {
    let offset = 0;
    for (let i = 0, n = options.length; i < n; ++i) {
        view.setUint32(ptr + offset, options[i], true);
        offset += 4;
    }
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
    const blob = file.slice(0, Math.min(config.maxRowSize, file.size));
    const buffer = await loadBlob(blob);

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
            numberCount: 0,
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
    };
    for (let i = 0, n = blobs.length; i < n; ++i) {
        const options = Object.assign({}, optionsBase, {
            blob: blobs[i],
            index: i,
        });
        promises.push(workerPool.scheduleTask('analyzeBlob', options));
    }

    const results = await Promise.all(promises);
    const chunks = new Array(blobs.length);
    const aggregated = {
        rowCount: 0,
        malformedRows: 0,
        minRowLength: Number.MAX_SAFE_INTEGER,
        maxRowLength: Number.MIN_SAFE_INTEGER,
    };

    for (let i = 0; i < results.length; ++i) {
        chunks[results[i].index] = new DataChunk(blobs[results[i].index], results[i].rowOffsets, results[i].columnsMeta);
        aggregated.rowCount += results[i].rowCount;
        aggregated.malformedRows += results[i].malformedRows;
        aggregated.minRowLength = Math.min(aggregated.minRowLength, results[i].minRowLength);
        aggregated.maxRowLength = Math.max(aggregated.maxRowLength, results[i].maxRowLength);

        const metaView = new Uint32Array(results[i].columnsMeta);
        for (let ii = 0, mi = 0; ii < header.length; ++ii, mi += 6) {
            header[ii].minLength = Math.min(header[ii].minLength, metaView[mi]);
            header[ii].maxLength = Math.max(header[ii].maxLength, metaView[mi + 1]);

            header[ii].emptyCount += metaView[mi + 2];
            header[ii].stringCount += metaView[mi + 3];
            header[ii].numberCount += metaView[mi + 4];
            header[ii].floatCount += metaView[mi + 5];
        }
    }
    return {
        chunks,
        meta: aggregated,
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
            return (view, offset, length) => {
                return decoder.decode(new Uint8Array(view.buffer, offset, length));
            };
        }
    }

}
