import * as DataTools from '../data/DataTools';

let gID = null;
let gWASM = null;
let gExports = null;
let gMemory = null;
let gView = null;
let gU8View = null;

async function init(options) {
    const memorySize = (DataTools.sizeOf1MB * 32) / (DataTools.sizeOf1KB * 64);
    gMemory = new WebAssembly.Memory({initial: memorySize, maximum: memorySize});
    gWASM = await new WebAssembly.Instance(options.wasm, {env: { memory: gMemory }});
    gExports = gWASM.exports;

    gView = new DataView(gMemory.buffer);
    gU8View = new Uint8Array(gMemory.buffer);

    return true;
}

async function calculateOffsets(options) {
    const maxRowSize = options.maxRowSize;
    const start = Math.max(options.end - maxRowSize, 0);
    const end = options.end + maxRowSize >= options.file.size ? options.end : options.end + maxRowSize;
    const blob = options.file.slice(start, end);
    const buffer = await DataTools.loadBlob(blob);

    const bufferPtr = 4;
    const optionsPtr = bufferPtr + Math.ceil(buffer.byteLength / 4) * 4;

    gU8View.set(new Uint8Array(buffer), bufferPtr);

    /*
    * options:
    *  0:[0] - buffer ptr
    *  4:[1] - buffer length
    *  8:[2] - start
    * 12:[3] - linebreak char
    * 16:[4] - result space
    */
    DataTools.writeOptionsToBuffer(gView, optionsPtr, [
        bufferPtr,
        buffer.byteLength,
        options.end - start,
        options.linebreak,
    ]);

    gExports._findClosestLineBreak(optionsPtr);

    return {
        offset: gView.getInt32(optionsPtr + 16, true),
        index: options.index,
    };
}

async function analyzeBlob(options) {
    const buffer = await DataTools.loadBlob(options.blob);

    const bufferPtr = 4;
    const optionsPtr = bufferPtr + Math.ceil(buffer.byteLength / 4) * 4;

    gU8View.set(new Uint8Array(buffer), bufferPtr);

    /*
     * typedef struct
     * {
     *     byte *buffer;
     *     uint32 length;
     *     {
     *         uint32 linebreak;
     *         uint32 separator;
     *         uint32 qualifier;
     *     {
     *     uint32 columnCount;
     *     AnalyzeBufferResult *result;
     * }
     * AnalyzeBufferOptions;
     */
    DataTools.writeOptionsToBuffer(gView, optionsPtr, [
        bufferPtr,
        buffer.byteLength,
        options.linebreak,
        options.separator,
        options.qualifier,
        options.columnCount,
        0,
    ]);

    gExports._analyzeBuffer(optionsPtr);

    /*
     * typedef struct
     * {
     *     AnalyzeBufferStats stats;
     *     ColumnDescriptor *columns;
     *     RowOffset *rows;
     * }
     * AnalyzeBufferResult;
     */
    const resultPtr = gView.getUint32(optionsPtr + 24, true);
    const statsPtr = resultPtr;
    const columnsPtr = gView.getUint32(resultPtr + 20, true);
    const rowsPtr = gView.getUint32(resultPtr + 24, true);

    /*
     * typedef struct
     * {
     *     uint32 rowCount;
     *     uint32 malformedRows;
     *     uint32 minRowLength;
     *     uint32 maxRowLength;
     *     uint32 sizeOfColumn;
     * }
     * AnalyzeBufferStats;
     */
    const rowCount = gView.getUint32(statsPtr, true);
    const malformedRows = gView.getUint32(statsPtr + 4, true);
    const minRowLength = gView.getUint32(statsPtr + 8, true);
    const maxRowLength = gView.getUint32(statsPtr + 12, true);
    const sizeOfColumn = gView.getUint32(statsPtr + 16, true);
    /*
     * typedef struct
     * {
     *     uint32 minLength;
     *     uint32 maxLength;
     *     uint32 emptyCount;
     *     uint32 stringCount;
     *     uint32 numberCount;
     *     uint32 floatCount;
     * }
     * ColumnDescriptor;
     */
    const columnsMeta = gMemory.buffer.slice(columnsPtr, columnsPtr + sizeOfColumn * options.columnCount);

    /*
     * typedef uint32 RowOffset;
     */
    const rowOffsets = gMemory.buffer.slice(rowsPtr, rowsPtr + rowCount * 4);

    return {
        rowCount: rowCount,
        malformedRows: malformedRows,
        minRowLength: minRowLength,
        maxRowLength: maxRowLength,
        columnsMeta: columnsMeta,
        rowOffsets: rowOffsets,
        index: options.index,
    };
}

async function loadChunk(options) {
    const buffer = await DataTools.loadBlob(options.blob);

    const bufferPtr = 4;
    gU8View.set(new Uint8Array(buffer), bufferPtr);

    const columnLengthsPtr = bufferPtr + Math.ceil(buffer.byteLength / 4) * 4;
    for (let i = 0; i < options.columnCount; ++i) {
        gView.setUint32(columnLengthsPtr + 4 * i, options.columnLengths[i], true);
    }

    const columnOffsetsPtr = columnLengthsPtr + options.columnCount * 4;
    for (let i = 0; i < options.columnCount; ++i) {
        gView.setUint32(columnOffsetsPtr + 4 * i, options.columnOffsets[i], true);
    }

    const optionsPtr = columnOffsetsPtr + options.columnCount * 4;
    const optionsArr = [
        bufferPtr,
        buffer.byteLength,

        columnLengthsPtr,
        columnOffsetsPtr,
        options.columnCount,

        options.rowLength,
        options.rowCount,

        options.linebreak,
        options.separator,
        options.qualifier,

        // 0,
    ];
    DataTools.writeOptionsToBuffer(gView, optionsPtr, optionsArr);

    gExports._loadChunk(optionsPtr);

    const rowsPtr = gView.getUint32(optionsPtr + optionsArr.length * 4, true);

    const result = gMemory.buffer.slice(rowsPtr, rowsPtr + options.rowLength * options.rowCount);

    return {
        buffer: result,
    };
}

function sendError(id, reason) {
    self.postMessage({
        type: 'error',
        id,
        reason,
    });
}

function sendSuccess(id, data = null, transferable = null) {
    self.postMessage({
        type: 'success',
        id,
        data,
    }, transferable);
}

self.onmessage = async function CSVManagerWorkerOnMessage(e) {
    const message = e.data;
    switch (message.type) {
        case 'init':
            gID = message.options.id;
            sendSuccess(gID, await init(message.options));
            break;

        case 'calculateOffsets':
            sendSuccess(gID, await calculateOffsets(message.options));
            break;

        case 'analyzeBlob': {
            const result = await analyzeBlob(message.options);
            sendSuccess(gID, result, [result.columnsMeta, result.rowOffsets]);
        }
            break;

        case 'loadChunk': {
            const result = await loadChunk(message.options);
            sendSuccess(gID, result, [result.buffer])
        }
            break;

        case 'close':
            self.close();
            break;

        default:
            sendError(gID, `Unrecognized message type "${message.type}"`);
            break;
    }
};
