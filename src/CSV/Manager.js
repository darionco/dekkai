import ManagerWorker from 'worker-loader!./Manager.worker';

export class Manager {
    constructor(file) {
        this.mFile = file;
        this.mWorker = new ManagerWorker();
        this.mMessageCounter = 0;
        this.mPendingMessages = {};
        this.mHeader = null;

        this.mWorker.onmessage = this._handleWorkerMessage.bind(this);
        this.mInitialized = this.postMessageToManager({
            type: 'initialize',
            file: this.mFile,
        }).then(header => {
            this.mHeader = header;
        });
    }

    get initializedPromise() {
        return this.mInitialized;
    }

    async getHeader() {
        await this.mInitialized;
        return this.mHeader;
    }

    postMessageToManager(message) {
        return new Promise((resolve, reject) => {
            const id = this.mMessageCounter++;
            const data = Object.assign({}, message, { id });
            this.mPendingMessages[id] = { resolve, reject };
            this.mWorker.postMessage(data);
        });
    }

    _handleWorkerMessage(e) {
        const message = e.data;
        switch (message.type) {
            case 'success':
                if (this.mPendingMessages.hasOwnProperty(message.id)) {
                    this.mPendingMessages[message.id].resolve(message.data);
                    delete this.mPendingMessages[message.id];
                } else {
                    throw `ERROR: Could not find message ID (${message.id})`;
                }
                break;

            case 'error':
                if (this.mPendingMessages.hasOwnProperty(message.id)) {
                    this.mPendingMessages[message.id].reject(message.reason);
                    delete this.mPendingMessages[message.id];
                } else {
                    throw `ERROR: Could not find message ID (${message.id})`;
                }
                break;

            default:
                throw `ERROR: Unknown manager worker message "${message.type}"`;
        }
    }
}
