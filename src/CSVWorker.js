import {CSVChunk} from './CSVChunk';

async function parseChunk(chunk, columnCount) {
    const rows = [];
    chunk.reset();

    let offset = chunk.offset;
    let success;
    while (offset < chunk.back) {
        const row = [];
        success = await chunk.nextRow(row);
        if (success) {
            if (row.length === columnCount) {
                rows.push(row);
            } else {
                success = false;
            }
        }

        if (!success) {
            if (offset === 0) {
                chunk.setFront();
            } else if (chunk.offset === chunk.size) {
                chunk.setBack(offset);
            } else {
                throw 'Malformed CSV!';
            }
        }

        offset = chunk.offset;
    }

    return {
        rows,
        transfer: [ chunk.bytes ],
    };
}

let id = -1;
global.onmessage = async e => {
    const message = e.data;
    console.log(`Message:${message.type} ID:${id}`);
    switch (message.type) {
        case 'setID':
            id = message.id;
            break;

        case 'parseChunk': {
            const result = await parseChunk(CSVChunk.deserialize(message.options.chunk), message.options.columnCount);
            global.postMessage({
                type: 'success',
                // result: result.rows,
            });
        }
            break;

        default:
            throw `ERROR: Unrecognized message type ${message.type}`;
    }
};
