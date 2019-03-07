import * as DataTools from './DataTools';

const kHeaderMaxSize = 1024 * 256; // 256KB

async function calculateOffsets(options) {
    const start = options.end - kHeaderMaxSize;
    const end = options.end + kHeaderMaxSize >= options.file.size ? options.end : options.end + kHeaderMaxSize;
    const blob = options.file.slice(start, end);
    const buffer = await DataTools.loadBlob(blob);
    const newLineOffset = DataTools.findClosestNewLine(buffer, kHeaderMaxSize);
    return {
        offset: newLineOffset,
        index: options.index,
    };
}

async function analyzeBlob(options) {
    const buffer = await DataTools.loadBlob(options.blob);
    const header = options.header;
    const headerLength = header.length;
    const view = new DataView(buffer);
    const row = [];
    const columns = {};
    let offset = 0;
    let column;
    let value;
    let i;

    for (i = 0; i < headerLength; ++i) {
        columns[header[i].name] = {
            number: {
                min: Number.MAX_SAFE_INTEGER,
                max: Number.MIN_SAFE_INTEGER,
                isFloat: false,
                count: 0,
            },
            string: {
                min: Number.MAX_SAFE_INTEGER,
                max: Number.MIN_SAFE_INTEGER,
                count: 0,
            },
        };
    }

    while (offset < buffer.byteLength) {
        row.length = 0;
        offset = DataTools.readRow(view, offset, row);

        if (row.length !== headerLength) {
            throw 'ERROR: Malformed CSV!';
        }

        for (i = 0; i < headerLength; ++i) {
            column = header[i].name;
            value = String.fromCharCode(...row[i]).replace(/^"(.+(?="$))"$/, '$1');

            columns[column].string.min = Math.min(columns[column].string.min, value.length);
            columns[column].string.max = Math.max(columns[column].string.max, value.length);

            if (isNaN(value)) {
                ++columns[column].string.count;
            } else {
                value = parseFloat(value);
                ++columns[column].number.count;
                columns[column].number.min = Math.min(columns[column].number.min, value);
                columns[column].number.max = Math.max(columns[column].number.max, value);
                columns[column].number.isFloat = columns[column].number.isFloat || !Number.isInteger(value);
            }
        }
    }

    console.log(columns);

    return {
        index: options.index,
        columns,
    };
}

function sendError(id, reason) {
    global.postMessage({
        type: 'error',
        id,
        reason,
    });
}

function sendSuccess(id, data = null) {
    global.postMessage({
        type: 'success',
        id,
        data,
    });
}

global.onmessage = async function CSVManagerWorkerOnMessage(e) {
    const message = e.data;
    switch (message.type) {
        case 'calculateOffsets':
            sendSuccess(null, await calculateOffsets(message.options));
            break;

        case 'analyzeBlob':
            sendSuccess(null, await analyzeBlob(message.options));
            break;

        default:
            sendError(null, `Unrecognized message type "$message.type{}"`);
            break;
    }
};
