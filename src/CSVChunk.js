const kCommaCode = (',').charCodeAt(0);
const kQuotesCode = ('"').charCodeAt(0);
const kLineBreakCode = ('\n').charCodeAt(0);

export class CSVChunk {
    constructor(blob) {
        this.mBlob = blob;
        this.mRows = -1;
        this.mFront = 0;
        this.mBack = this.mBlob.byteLength;
        this.mBytesFront = null;
        this.mBytesBack = null;
        this.mBytes = null;
        this.mView = null;

        this.mOffset = 0;
    }

    get bytes() {
        return this.mBytes;
    }

    get view() {
        return this.mView;
    }

    get rows() {
        return this.mRows;
    }

    get offset() {
        return this.mOffset;
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
        this.mOffset = 0;
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

        const initialOffset = this.mOffset;
        let isInQuotes = false;
        let char;
        let i;
        for (i = 0; i < this.mBytes.byteLength; ++i) {
            char = this.mView.getUint8(i);
            if (char === kQuotesCode) {
                isInQuotes = !isInQuotes;
            } else if (char === kCommaCode && !isInQuotes) {
                row.push(new Uint8Array(this.mBytes, this.mOffset, i - this.mOffset));
                this.mOffset = i + 1;
            } else if (char === kLineBreakCode) {
                if (isInQuotes) {
                    this.mOffset = i + 1;
                    return new Uint8Array(this.mBytes, initialOffset, i - initialOffset);
                }

                row.push(new Uint8Array(this.mBytes, this.mOffset, i - this.mOffset));
                this.mOffset = i + 1;
                return null;
            }
        }
        return new Uint8Array(this.mBytes, initialOffset, i - initialOffset);
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
