export class DataSource {
    constructor() {
        this.mChunks = [];
        this.mProgress = null;
        this.mBytesLoaded = 0;
        this.mTotalBytes = 0;
    }
}
