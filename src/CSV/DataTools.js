const kCommaCode = (',').charCodeAt(0);
const kQuotesCode = ('"').charCodeAt(0);
const kLineBreakCode = ('\n').charCodeAt(0);

export function loadBlob(blob) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsArrayBuffer(blob);
    });
}

export function readRow(view, offset, result) {
    let fieldOffset = offset;
    let isInQuotes = false;
    let char;
    let i;
    for (i = offset; i < view.byteLength; ++i) {
        char = view.getUint8(i);
        if (char === kQuotesCode) {
            isInQuotes = !isInQuotes;
        } else if (char === kCommaCode && !isInQuotes) {
            result.push(new Uint8Array(view.buffer, fieldOffset, i - fieldOffset));
            fieldOffset = i + 1;
        } else if (char === kLineBreakCode) {
            if (isInQuotes) {
                throw 'ERROR: Malformed CSV!';
            }

            result.push(new Uint8Array(view.buffer, fieldOffset, i - fieldOffset));
            return i + 1;
        }
    }
    return i;
}

export function findClosestNewLine(buffer, start) {
    const view = new DataView(buffer);
    let forward = null;
    let backward = null;
    let offset = start;

    while (offset < buffer.byteLength) {
        if (view.getUint8(offset) === kLineBreakCode) {
            forward = (offset - start) + 1;
            break;
        }
        ++offset;
    }

    offset = start - 1;
    while (offset >= 0) {
        if (view.getUint8(offset) === kLineBreakCode) {
            backward = (offset - start) + 1;
            break;
        }
        --offset;
    }

    if (forward === null && backward === null) {
        return null;
    } else if (forward === null) {
        return backward;
    } else if (backward === null) {
        return forward;
    }

    return forward < Math.abs(backward) ? forward : backward;
}
