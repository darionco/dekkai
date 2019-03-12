import {WorkerManager} from './WorkerManager';
import {TableRow, TableView} from '../../lib/TableView.js/src';

export class Table {
    constructor(file) {
        this.mFile = file;
        this.mWorkerManager = new WorkerManager();
        this.mInitialized = this.mWorkerManager.initialize(this.mFile);
    }

    get header() {
        return this.getHeader();
    }

    async getHeader() {
        await this.mInitialized;
        return this.mWorkerManager.header;
    }

    async getPage(index) {
        return this.mWorkerManager.parseBlob(index);
    }

    async renderPage(element, pageIndex) {
        const header = await this.getHeader();
        const page = await this.getPage(pageIndex);
        const columnCount = header.length;
        const view = new TableView(columnCount, page.length, 18, (row, index) => {
            if (index % 2) {
                row.element.style.backgroundColor = '#fafaff';
            } else {
                row.element.style.backgroundColor = '#ffffff';
            }

            const rowData = page[index];
            for (let i = 0; i < columnCount; ++i) {
                row.setContent(i, String.fromCharCode(...rowData[i]).replace(/^"(.+(?="$))"$/, '$1'));
            }
            return row;
        });
        // view.runHot = true;
        view.parent = element;

        const tableHeader = new TableRow(columnCount, 22);
        tableHeader.element.style.backgroundColor = '#eafaff';
        tableHeader.element.style.fontWeight = 'bold';
        for (let i = 0; i < columnCount; ++i) {
            tableHeader.setContent(i, header[i].name.replace(/^"(.+(?="$))"$/, '$1'));
        }
        view.mHeader.appendChild(tableHeader.element);
    }
}
