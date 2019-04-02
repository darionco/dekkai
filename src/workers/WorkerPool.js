export class WorkerPool {
    static get sharedInstance() {
        return kSharedInstance; // eslint-disable-line
    }

    constructor(workers = []) {
        this.mWorkers = workers;
        this.mIdleWorkers = [...workers];
        this.mTasks = [];
    }

    get workers() {
        return this.mWorkers;
    }

    get workerCount() {
        return this.mWorkers.length;
    }

    get tasks() {
        return this.mTasks;
    }

    get running() {
        return this.mTasks.length || this.mIdleWorkers.length !== this.mWorkers.length;
    }

    scheduleTask(type, options, transferable = null) {
        return new Promise((resolve, reject) => {
            if (this.mIdleWorkers.length) {
                this._executeTask(this.mIdleWorkers.pop(), type, options, transferable, resolve, reject);
            } else {
                this.mTasks.unshift({
                    type,
                    options,
                    transferable,
                    resolve,
                    reject,
                });
            }
        });
    }

    addWorker(worker) {
        this.mWorkers.push(worker);
        this._executeTaskFromQueue(worker);
    }

    removeWorker() {
        if (this.mIdleWorkers.length) {
            const worker = this.mIdleWorkers.pop();
            const i = this.mWorkers.indexOf(worker);
            this.mWorkers.splice(i, 1);
            return worker;
        }
        return null;
    }

    _executeTask(worker, type, options, transferable, resolve, reject) {
        worker.onmessage = e => {
            const message = e.data;
            worker.onmessage = null;

            if (message.type === 'success') {
                resolve(message.data);
            } else if (message.type === 'error') {
                reject(message.reason);
            } else {
                throw `ERROR: Unrecognized message type sent from data worker "${message.type}"`;
            }

            this._executeTaskFromQueue(worker);
        };

        worker.postMessage({
            type,
            options,
        }, transferable);
    }

    _executeTaskFromQueue(worker) {
        if (this.mTasks.length) {
            const task = this.mTasks.pop();
            this._executeTask(worker, task.type, task.options, task.transferable, task.resolve, task.reject);
        } else {
            this.mIdleWorkers.push(worker);
        }
    }
}

const kSharedInstance = new WorkerPool([]);
