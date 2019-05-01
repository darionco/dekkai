/* handle running in node.js */
const kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

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

    killWorkers() {
        for (let i = 0, n = this.mWorkers.length; i < n; ++i) {
            this.mWorkers[i].terminate();
        }
        this.mWorkers.length = 0;
        this.mIdleWorkers.length = 0;
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

    addWorker(worker, initMessage = null) {
        this.mWorkers.push(worker);

        if (initMessage) {
            return new Promise((resolve, reject) => {
                const addListener = worker.addEventListener || worker.on;
                const removeListener = worker.removeEventListener || worker.off;

                const handler = e => {
                    const message = e.data;
                    removeListener.call(worker, 'message', handler);

                    if (message.type === 'success') {
                        this._executeTaskFromQueue(worker);
                        resolve();
                    } else if (message.type === 'error') {
                        reject(message.reason);
                    } else {
                        reject(`ERROR: Unrecognized message type sent from data worker "${message.type}"`);
                    }
                };
                addListener.call(worker, 'message', handler);
                worker.postMessage(kIsNodeJS ? { data: initMessage } : initMessage);
            });
        }

        this._executeTaskFromQueue(worker);
        return Promise.resolve();
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
        const addListener = worker.addEventListener || worker.on;
        const removeListener = worker.removeEventListener || worker.off;
        const handler = e => {
            const message = e.data;
            removeListener.call(worker, 'message', handler);

            if (message.type === 'success') {
                resolve(message.data);
            } else if (message.type === 'error') {
                reject(message.reason);
            } else {
                throw `ERROR: Unrecognized message type sent from data worker "${message.type}"`;
            }

            this._executeTaskFromQueue(worker);
        };
        addListener.call(worker, 'message', handler);

        const message = {
            type,
            options,
        };
        worker.postMessage(kIsNodeJS ? { data: message } : message, transferable);
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
