import {CSVChunk} from './CSVChunk';
import {TableView} from '../lib/TableView.js/src';
import {TableRow} from '../lib/TableView.js/src';
import {CSVWorkerManager} from './CSVWorkerManager';

const kChunkSize = 1024 * 1024 * 4; // 4MB

export class CSVTable {
    constructor(file) {
        this.mFile = file;
        this.mChunks = [];
        this.mMinParsedChunk = 0;
        this.mMaxParsedChunk = 0;
        this.mParsedChunks = [];
        this.mBytesParsed = 0;
        this.mRowsParsed = 0;
        this.mHeaderSize = 0;
        this.mDataSize = 0;
        this.mEstimatedRowCount = 0;
        this.mHeader = null;
        this.mLoaded = false;
        this.mWorkerManager = new CSVWorkerManager();

        let offset = 0;
        while (offset < this.mFile.size) {
            this.mChunks.push(new CSVChunk(this.mFile.slice(offset, Math.min(offset + kChunkSize, this.mFile.size))));
            offset += kChunkSize;
        }
    }

    async initMetadata() {
        if (this.mHeader) {
            return this.mHeader;
        }

        this.mChunks[0].reset();

        const row = [];
        if (!await this.mChunks[0].nextRow(row)) {
            throw 'Malformed CSV!';
        }

        const start = new Date();
        const promises = [];
        for (let i = 0; i < this.mChunks.length; ++i) {
            const promise = this.mWorkerManager.scheduleTask('parseChunk', {
                chunk: CSVChunk.serialize(this.mChunks[i]),
                columnCount: row.length,
            });
            promises.push(promise);
        }

        Promise.all(promises).then(result => {
            const end = new Date();
            console.log(`Time: ${end - start}`);
            console.log(result);
        });

        this.mChunks[0].setFront();
        this.mHeader = row;
        this.mHeaderSize = this.mChunks[0].front;
        this.mDataSize = this.mFile.size - this.mHeaderSize;

        const rows = await this.parseChunk(0, this.mHeader.length);
        this.mParsedChunks.push({
            index: 0,
            rows: rows,
            minRow: 0,
            maxRow: rows.length - 1,
        });

        return this.mHeader;
    }

    async parseChunk(index, columnCount) {
        const rows = [];
        this.mChunks[index].reset();

        let offset = this.mChunks[index].offset;
        let success;
        while (offset < this.mChunks[index].back) {
            const row = [];
            success = await this.mChunks[index].nextRow(row);
            if (success) {
                if (row.length === columnCount) {
                    rows.push(row);
                } else {
                    success = false;
                }
            }

            if (!success) {
                if (offset === 0) {
                    this.mChunks[index].setFront();
                } else if (this.mChunks[index].offset === this.mChunks[index].size) {
                    this.mChunks[index].setBack(offset);
                } else {
                    throw 'Malformed CSV!';
                }
            }

            offset = this.mChunks[index].offset;
        }

        if (this.mChunks[index].rowCount === -1) {
            this.mChunks[index].rowCount = rows.length;
            this.mBytesParsed += this.mChunks[0].back - this.mChunks[0].front;
            this.mRowsParsed += rows.length;
            this.mEstimatedRowCount = Math.round((this.mDataSize / this.mBytesParsed) * this.mRowsParsed);
        }

        return rows;
    }

    render(element) {
        const columnCount = this.mHeader.length;
        const view = new TableView(columnCount, this.mParsedChunks[0].rows.length, 18, (row, index) => {
            if (index % 2) {
                row.element.style.backgroundColor = '#fafaff';
            } else {
                row.element.style.backgroundColor = '#ffffff';
            }

            const rowData = this.mParsedChunks[0].rows[index];
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
            tableHeader.setContent(i, String.fromCharCode(...this.mHeader[i]).replace(/^"(.+(?="$))"$/, '$1'));
        }
        view.mHeader.appendChild(tableHeader.element);
    }
}
