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
    const optionsPtr = buffer.byteLength + bufferPtr;

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
    const optionsPtr = buffer.byteLength + bufferPtr;

    gU8View.set(new Uint8Array(buffer), bufferPtr);

    /*
    * options:
    *  0:[0] - buffer ptr
    *  4:[1] - buffer length
    *  8:[2] - linebreak char
    * 12:[3] - separator char
    * 16:[4] - qualifier char
    * 20:[5] - columnCount
    * 24:[6] - result start address
    */
    DataTools.writeOptionsToBuffer(gView, optionsPtr, [
        bufferPtr,
        buffer.byteLength,
        options.linebreak,
        options.separator,
        options.qualifier,
        options.columnCount,
    ]);

    gExports._analyzeBuffer(optionsPtr);

    const rowCount = gView.getUint32(optionsPtr + 24, true);
    const sizeOfField = gView.getUint32(optionsPtr + 40, true);
    const fieldsLength = sizeOfField * options.columnCount;
    const fieldsPtr = optionsPtr + 44;
    const columnsMeta = gMemory.buffer.slice(fieldsPtr, fieldsPtr + fieldsLength);
    const rowOffsets = gMemory.buffer.slice(fieldsPtr + fieldsLength, fieldsPtr + fieldsLength + rowCount * 4);

    return {
        rowCount: rowCount,
        malformedRows: gView.getUint32(optionsPtr + 28, true),
        minRowLength: gView.getUint32(optionsPtr + 32, true),
        maxRowLength: gView.getUint32(optionsPtr + 36, true),
        columnsMeta: columnsMeta,
        rowOffsets: rowOffsets,
        index: options.index,
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

        case 'parseBlob':
            break;

        case 'close':
            self.close();
            break;

        default:
            sendError(gID, `Unrecognized message type "${message.type}"`);
            break;
    }
};
