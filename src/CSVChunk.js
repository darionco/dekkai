const kCommaCode = (',').charCodeAt(0);
const kQuotesCode = ('"').charCodeAt(0);
const kLineBreakCode = ('\n').charCodeAt(0);

export class CSVChunk {
    static serialize(chunk) {
        return Object.assign({}, chunk);
    }

    static deserialize(info) {
        const ret = new CSVChunk(info.mBlob);
        Object.assign(ret, info);
        return ret;
    }

    constructor(blob) {
        this.mBlob = blob;
        this.mRowCount = -1;
        this.mFront = 0;
        this.mBack = this.mBlob.size;
        this.mBytesFront = null;
        this.mBytesBack = null;
        this.mBytes = null;
        this.mView = null;

        this.mOffset = 0;
    }

    get front() {
        return this.mFront;
    }

    get back() {
        return this.mBack;
    }

    get size() {
        return this.mBlob.size;
    }

    get bytes() {
        return this.mBytes;
    }

    get view() {
        return this.mView;
    }

    get offset() {
        return this.mOffset;
    }

    get rowCount() {
        return this.mRowCount;
    }

    set rowCount(value) {
        this.mRowCount = value;
    }

    async load() {
        if (this.mBytes) {
            return this.mBytes;
        }

        return await this._load();
    }

    unload() {
        this.mView = null;
        this.mBytes = null; // schedule for garbage collection
    }

    reset() {
        this.mOffset = this.mFront;
    }

    setFront(offset = this.mOffset) {
        this.mFront = offset;
        this.mBytesFront = new Uint8Array(this.mBytes.slice(0, this.mFront));
    }

    setBack(offset = this.mOffset) {
        this.mBack = offset;
        this.mBytesBack = new Uint8Array(this.mBytes.slice(this.mBack, this.mBytes.byteLength));
    }

    async nextRow(row) {
        await this.load();

        let isInQuotes = false;
        let char;
        let i;
        for (i = this.mOffset; i < this.mBytes.byteLength; ++i) {
            char = this.mView.getUint8(i);
            if (char === kQuotesCode) {
                isInQuotes = !isInQuotes;
            } else if (char === kCommaCode && !isInQuotes) {
                row.push(new Uint8Array(this.mBytes, this.mOffset, i - this.mOffset));
                this.mOffset = i + 1;
            } else if (char === kLineBreakCode) {
                if (isInQuotes) {
                    this.mOffset = i + 1;
                    return false;
                }

                row.push(new Uint8Array(this.mBytes, this.mOffset, i - this.mOffset));
                this.mOffset = i + 1;
                return true;
            }
        }
        this.mOffset = i;
        return false;
    }

    _load() {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => {
                this.mBytes = reader.result;
                this.mView = new DataView(this.mBytes);
                resolve(this.mBytes);
            };
            reader.readAsArrayBuffer(this.mBlob);
        });
    }
}
