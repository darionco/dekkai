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
