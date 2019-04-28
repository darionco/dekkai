# dekkai
Modern and fast, really fast, CSV parser for the browser and node.js    

**WARNING:** This is pre-release code, although stable, some features have not been implemented yet.

### Installation
```
yarn add dekkai
```
or
```
npm install dekkai
```

### Usage
#### Loading a file
In the browser:
```javascript
import dekkai from 'dekkai';

async function main() {
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('name', 'dataFile');
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', async e => {
        e.preventDefault();
        await dekkai.init(/* number of threads, blank for auto-detect */);
        
        const table = await dekkai.loadLocalFile(fileInput.files[0]);
    });
}

main();
```

In Node.js
```javascript
const dekkai = require('dekkai/dist/umd/dekkai');
const path = require('path');
const fs = require('fs');

function open(file) {
    return new Promise((resolve, reject) => {
        fs.open(path.resolve(file), (err ,fd) => {
            if (err) {
                reject(err);
            } else {
                resolve(fd);
            }
        });
    });
}

async function main() {
    await dekkai.init(/* number of threads, blank for auto-detect */);
    const file = await open(path.resolve(__dirname, '../Airports2.csv'));
    const table = await dekkai.loadLocalFile(file);
}

main();
```

#### Accessing the data
```javascript
/* access the data through the table methods */
table.setColumnType('Fly_date', 'string'); // overwrite the specified column's detected type
table.setColumnType(13, 'int'); // can be done by column index

/* iterate through all the rows */
await table.forEach(row => {
    console.log(row.valueByName('Origin_city')); // get a value by column name
    console.log(row.valueByNameTyped('Passengers')); // parse the value as its type
    console.log(row.valueByIndex(0)); // get a value by column index
    console.log(row.valueByNameTyped(6)); // parse the value as its type
});

/* get arbitrary row numbers */
for (let i = 100; i < 200 && i < table.rowCount; ++i) {
    const row = await table.getRow(i);
    let str = '';
    /* iterate over all the values in the row */
    row.forEach(value => {
        str += value + '\t';
    });
    console.log(str);
}
```

#### Teardown
```javascript
/* terminate dekkai */
dekkai.terminate();
```

### Example
- Checkout this repo
- Install [yarn](https://yarnpkg.com/en/) if needed.
- On the command line navigate to the repo's folder
- Run `yarn install`
- Run `yarn start` and wait for project to build
- In your browser, navigate to `localhost:8090`
- Load a CSV huge CSV file!

### Benchmark
**CPU:** 6 cores, 2.6 GHz, Core i7 (I7-8850H)  
**File:** [Airports2.csv](https://www.kaggle.com/flashgordon/usa-airport-dataset/version/2), 15 columns, 3606803 rows, 509MB

| Language  |        Library        | Typed | Single-thread | Multi-thread(6) |
|-----------|-----------------------|-------|---------------|-----------------|
| JS (Node) | dekkai                | Yes   | 5629ms        | 1088ms          |
| JS (Web)  | dekkai                | Yes   | 5311ms        | 1156ms          |
|           |                       |       |               |                 |
| C++11     | fast-cpp-csv-parser   | Yes   | 1797ms        | N/A             |
| Go        | encoding/csv          | N/A   | 2135ms        | N/A             |
| Go        | weberc2/fastcsv       | N/A   | 3075ms        | N/A             |
| C++11     | AriaFallah/csv-parser | N/A   | 4011ms        | N/A             |
| JS (Web)  | Papa Parse 4          | No    | 11913ms       | N/A             |
| JS (Web)  | Papa Parse 4          | Yes   | 19508ms       | N/A             |
| JS (Node) | fast-csv              | N/A   | 35789ms       | N/A             |


