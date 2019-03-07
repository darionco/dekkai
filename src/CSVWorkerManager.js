import CSVWorker from 'worker-loader!./CSVWorker';

export class CSVWorkerManager {
    constructor(workerCount = 4) {
        this.mWorkerCount = workerCount;
        this.mWorker = [];
        this.mTasks = [];

        for (let i = 0; i < this.mWorkerCount; ++i) {
            const worker = new CSVWorker();
            worker.postMessage({
                type: 'setID',
                id: i,
            });
            this.mWorker.push(worker);
        }
    }

    scheduleTask(type, options) {
        return new Promise(resolve => {
            if (this.mWorker.length) {
                this._executeTask(this.mWorker.pop(), type, options, resolve);
            } else {
                this.mTasks.unshift({
                    type,
                    options,
                    resolve,
                });
            }
        });
    }

    _executeTask(worker, type, options, resolve) {
        worker.onmessage = e => {
            worker.onmessage = null;
            resolve(e.data);
            if (this.mTasks.length) {
                const task = this.mTasks.pop();
                this._executeTask(worker, task.type, task.options, task.resolve);
            } else {
                this.mWorker.push(worker);
            }
        };

        worker.postMessage({
            type,
            options,
        });
    }
}
