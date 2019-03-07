import {Manager} from './Manager';

export class Table {
    constructor(file) {
        this.mFile = file;
        this.mManager = new Manager(this.mFile);
    }

    get header() {
        return this.mManager.getHeader();
    }
}
