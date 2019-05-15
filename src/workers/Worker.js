import * as DataTools from '../data/DataTools';
import {DataFile} from '../data/DataFile';
import {PARSING_MODE} from '../data/ParsingModes';
import {combineTypedArrays} from '../data/DataTools';

const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';
const kRequire = kIsNodeJS ? module.require : null; // eslint-disable-line
const _self = kIsNodeJS ? kRequire('worker_threads').parentPort : self; // eslint-disable-line

let gID = null;
let gWASM = null;
let gExports = null;
let gMemory = null;
let gView = null;
let gU8View = null;

async function init(options) {
    const memorySize = (DataTools.sizeOf1MB * 64) / (DataTools.sizeOf1KB * 64);
    gMemory = new WebAssembly.Memory({initial: memorySize, maximum: memorySize});
    gWASM = await new WebAssembly.Instance(options.wasm, {
        env: {
            memory: gMemory,
        },
    });
    gExports = gWASM.exports;

    gView = new DataView(gMemory.buffer);
    gU8View = new Uint8Array(gMemory.buffer);

    return true;
}

async function calculateOffsets(options) {
    const maxRowSize = options.maxRowSize;
    const start = Math.max(options.end - maxRowSize, 0);
    const end = options.end + maxRowSize >= options.file.size ? options.end : options.end + maxRowSize;
    const dataFile = DataFile.deserialize(options.file);
    const blob = dataFile.slice(start, end);
    const buffer = await blob.load();

    // byte *data;
    const dataPtr = 4;
    gU8View.set(new Uint8Array(buffer), dataPtr);

    // typedef struct
    // {
    //     byte *data;
    //     uint32 length;
    // }
    // Buffer;
    const bufferPtr = dataPtr + Math.ceil(buffer.byteLength / 4) * 4;
    const bufferPtrLength = DataTools.writeOptionsToBuffer(gView, bufferPtr, [
        dataPtr,
        buffer.byteLength,
    ]);

    // typedef struct
    // {
    //     uint32 linebreak;
    //     uint32 separator;
    //     uint32 qualifier;
    // }
    // SpecialChars;
    const specialCharsPtr = bufferPtr + bufferPtrLength;
    const specialCharsPtrLength = DataTools.writeOptionsToBuffer(gView, specialCharsPtr, [
        options.linebreak,
        options.separator,
        options.qualifier,
    ]);

    // int32 *result;
    const resultPtr = specialCharsPtr + specialCharsPtrLength;

    gExports._findRowEnd(bufferPtr, specialCharsPtr, resultPtr, options.end - start);

    return gView.getInt32(resultPtr, true);
}

async function parseBlob(options) {
    const blob = DataFile.deserializeBlob(options.blob);
    const buffer = await blob.load();

    // byte *data;
    const dataPtr = 4;
    gU8View.set(new Uint8Array(buffer), dataPtr);

    // typedef struct
    // {
    //     byte *data;
    //     uint32 length;
    // }
    // Buffer;
    const bufferPtr = dataPtr + Math.ceil(buffer.byteLength / 4) * 4;
    const bufferPtrLength = DataTools.writeOptionsToBuffer(gView, bufferPtr, [
        dataPtr,
        buffer.byteLength,
    ]);

    // typedef struct
    // {
    //     uint32 linebreak;
    //     uint32 separator;
    //     uint32 qualifier;
    // }
    // SpecialChars;
    const specialCharsPtr = bufferPtr + bufferPtrLength;
    const specialCharsPtrLength = DataTools.writeOptionsToBuffer(gView, specialCharsPtr, [
        options.linebreak,
        options.separator,
        options.qualifier,
    ]);

    // ParserResult *result;
    const resultPtr = specialCharsPtr + specialCharsPtrLength;

    gExports._parseBuffer(bufferPtr, specialCharsPtr, resultPtr, options.columnCount);

    return resultPtr;
}

function parseHeaderFromBuffer(buffer) {
    const view = new DataView(buffer);

    /*
     * Header:
     * 0 - row offset list ptr
     * 1 - row layout ptr
     * 2 - row data ptr
     */
    const offsetListPtr = view.getUint32(0, true);
    const layoutPtr = view.getUint32(4, true);
    const dataPtr = view.getUint32(8, true);

    return {
        offsetList: {
            ptr: offsetListPtr,
            length: layoutPtr - offsetListPtr,
        },
        layout: {
            ptr: layoutPtr,
            length: dataPtr - layoutPtr,
        },
        data: {
            ptr: dataPtr,
            length: buffer.byteLength - dataPtr,
        },
    };
}

function sendError(id, reason) {
    const message = {
        type: 'error',
        id,
        reason,
    };
    _self.postMessage(kIsNodeJS ? { data: message } : message);
}

function sendSuccess(id, data = null, transferable = null) {
    const message = {
        type: 'success',
        id,
        data,
    };
    _self.postMessage(kIsNodeJS ? { data: message } : message, transferable);
}

function sendParsedDataAnalyze(resultPtr, options) {
    const stats = {
        rowCount: gView.getUint32(resultPtr, true),
        malformedRows: gView.getUint32(resultPtr + 4, true),
        dataLength: gView.getUint32(resultPtr + 8, true),
        layoutLength: gView.getUint32(resultPtr + 12, true),
    };

    const columnInfoPtr = gView.getUint32(resultPtr + 16, true);
    const columns = gMemory.buffer.slice(columnInfoPtr, columnInfoPtr + options.columnCount * 24);

    sendSuccess(gID, {
        index: options.index,
        columns,
        stats,
    }, [ columns ]);
}

function sendParsedDataLoad(resultPtr, options) {
    const stats = {
        rowCount: gView.getUint32(resultPtr, true),
        malformedRows: gView.getUint32(resultPtr + 4, true),
        dataLength: gView.getUint32(resultPtr + 8, true),
        layoutLength: gView.getUint32(resultPtr + 12, true),
    };

    const columnInfoPtr = gView.getUint32(resultPtr + 16, true);
    const rowDataPtr = gView.getUint32(resultPtr + 20, true);
    const rowLayoutPtr = gView.getUint32(resultPtr + 24, true);

    const columns = gMemory.buffer.slice(columnInfoPtr, columnInfoPtr + options.columnCount * 24);

    const data = new Uint8Array(gMemory.buffer, rowDataPtr, stats.dataLength);
    const layout = new Uint8Array(gMemory.buffer, rowLayoutPtr, stats.layoutLength);

    const rowOffsetList = new Uint32Array(stats.rowCount);
    let rowOffset = 0;
    for (let i = 0; i < stats.rowCount; i++) {
        rowOffsetList[i] = rowOffset;
        rowOffset += 12 + gView.getUint32(rowLayoutPtr + rowOffset, true) * 12;
    }

    /*
     * Header:
     * 0 - row offset list ptr
     * 1 - row layout ptr
     * 2 - row data ptr
     */
    const header = new Uint32Array(3);
    header[0] = header.buffer.byteLength;
    header[1] = header[0] + rowOffsetList.buffer.byteLength;
    header[2] = header[1] + layout.length;

    const buffer = combineTypedArrays([header, rowOffsetList, layout, data]);

    sendSuccess(gID, {
        header: parseHeaderFromBuffer(buffer),
        index: options.index,
        columns,
        buffer,
        stats,
    }, [ columns, buffer ]);
}

function sendParsedDataBinary(parsedPtr, options) {
    const layoutLength = gView.getUint32(parsedPtr + 12, true);
    const rowLayoutPtr = gView.getUint32(parsedPtr + 24, true);
    const resultPtr = rowLayoutPtr + layoutLength;
    gExports._convertToBinary(parsedPtr, resultPtr, options.columnCount);

    // typedef struct
    // {
    //     BinaryHeader header {
    //         uint32 columnCount;
    //         uint32 rowCount;
    //         uint32 rowLength;
    //         uint32 *types;
    //         uint32 *lengths;
    //         uint32 *order;
    //         uint32 *offsets;
    //     }
    //     byte *data;
    // }
    // BinaryResult;

    const columnCount = gView.getUint32(resultPtr, true);
    const rowCount = gView.getUint32(resultPtr + 4, true);
    const rowLength = gView.getUint32(resultPtr + 8, true);

    const header = {
        columnCount,
        rowCount,
        rowLength,
        dataLength: rowCount * rowLength,
        types: [],
        lengths: [],
        order: [],
        offsets: [],
    };

    const typesPtr = gView.getUint32(resultPtr + 12, true);
    const lengthsPtr = gView.getUint32(resultPtr + 16, true);
    const orderPtr = gView.getUint32(resultPtr + 20, true);
    const offsetsPtr = gView.getUint32(resultPtr + 24, true);
    const dataPtr = gView.getUint32(resultPtr + 28, true);

    for (let i = 0; i < options.columnCount; ++i) {
        header.types.push(gView.getUint32(typesPtr + 4 * i, true));
        header.lengths.push(gView.getUint32(lengthsPtr + 4 * i, true));
        header.order.push(gView.getUint32(orderPtr + 4 * i, true));
        header.offsets.push(gView.getUint32(offsetsPtr + 4 * i, true));
    }

    // console.log(header);
    //
    // const row = [];
    //
    // for (let i = 0; i < options.columnCount; ++i) {
    //     if (header.types[i] === 0) {
    //         const len = gView.getUint8(dataPtr + header.offsets[i]);
    //         const buf = new Uint8Array(gMemory.buffer, dataPtr + header.offsets[i] + 1, len);
    //         row.push(String.fromCharCode(...buf));
    //     } else if (header.types[i] === 1) {
    //         row.push(gView.getInt32(dataPtr + header.offsets[i], true));
    //     } else {
    //         row.push(gView.getFloat32(dataPtr + header.offsets[i], true));
    //     }
    // }
    //
    // console.log(row);

    const data = gMemory.buffer.slice(dataPtr, dataPtr + header.rowLength * header.rowCount);

    sendSuccess(gID, {
        index: options.index,
        header,
        data,
    }, [ data ]);
}

function copyValue(source, sourceOffset, target, targetOffset, type) {
    if (type === 0) {
        const len = source.getUint8(sourceOffset);
        for (let i = 0; i <= len; ++i) {
            target.setUint8(targetOffset + i, source.getUint8(sourceOffset + i));
        }
    } else if (type === 1) {
        target.setInt32(targetOffset, source.getInt32(sourceOffset, true), true);
    } else if (type === 2) {
        target.setFloat32(targetOffset, source.getFloat32(sourceOffset, true), true);
    } else {
        throw `ERROR: Unrecognized type (${type})`;
    }
}

function mergeIntoBuffer(view, header, parsed, offset) {
    const parsedView = new DataView(parsed.data);
    let off = offset;
    let parsedOffset = 0;

    for (let i = 0; i < parsed.header.rowCount; ++i) {
        for (let ii = 0; ii < header.columns.length; ++ii) {
            copyValue(
                parsedView,
                parsedOffset + parsed.header.offsets[ii],
                view,
                off + header.columns[ii].offset,
                header.columns[ii].type
            );
        }
        off += header.rowLength;
        parsedOffset += parsed.header.rowLength;
    }

    return off;
}

function mergeParsedResults(options) {
    const buffer = options.buffer;
    const header = options.binaryHeader;
    const view = new DataView(buffer);
    let offset = options.dataOffset;

    for (let i = 0; i < options.parsed.length; ++i) {
        offset = mergeIntoBuffer(view, header, options.parsed[i], offset);
    }

    return buffer;
}

(_self.on || _self.addEventListener).call(_self, 'message', async function CSVManagerWorkerOnMessage(e) {
    const message = e.data;
    switch (message.type) {
        case 'init':
            gID = message.options.id;
            sendSuccess(gID, await init(message.options));
            break;

        case 'calculateOffsets':
            sendSuccess(gID, {
                offset: await calculateOffsets(message.options),
                index: message.options.index,
            });
            break;

        case 'parseBlob': {
            const result = await parseBlob(message.options);
            switch (message.options.mode) {
                case PARSING_MODE.ANALYZE:
                    sendParsedDataAnalyze(result, message.options);
                    break;

                case PARSING_MODE.LOAD:
                    sendParsedDataLoad(result, message.options);
                    break;

                case PARSING_MODE.BINARY:
                    sendParsedDataBinary(result, message.options);
                    break;

                default:
                    break;
            }
        }
            break;

        case 'mergeParsedResults': {
            const buffer = mergeParsedResults(message.options);
            sendSuccess(gID, { buffer }, [ buffer ]);
        }
            break;

        case 'mergeIntoBuffer':
            mergeIntoBuffer(
                new DataView(message.options.buffer),
                message.options.binaryHeader,
                message.options.parsed,
                message.options.dataOffset
            );
            sendSuccess(gID, {});
            break;

        case 'close':
            _self.close();
            if (kIsNodeJS) {
                process.exit(); // eslint-disable-line
            }
            break;

        default:
            sendError(gID, `Unrecognized message type "${message.type}"`);
            break;
    }
});
