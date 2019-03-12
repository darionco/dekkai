import {WorkerManager} from './WorkerManager';

export class Manager {
    constructor(file) {
        this.mFile = file;
        this.mWorkerManager = new WorkerManager();
        this.mMessageCounter = 0;
        this.mPendingMessages = {};

        this.mInitialized = this.mWorkerManager.initialize(this.mFile);
    }

    async getHeader() {
        await this.mInitialized;
        return this.mHeader;
    }
}
