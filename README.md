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
dekkai allows users to load files in three modes:
- text mode
- binary mode
- iterative

In **text mode**, dekkai stores the actual content of the parsed csv file in memory,
this mode is useful when the parsed file contains long strings of text and the
focus should be in content preservation. Type detection is still performed and
values can be read as their detected or configured types.  

When in **binary mode**, files take a bit longer to parse and dekkai saves the parsed
data in binary format, meaning that numbers (float and int) are written in memory as
their primitive types. Any row that is malformed or contains types different than the
detected column types is not included in the final output. The advantage of this approach is 
that data is then accessible very efficiently and mathematical operations are fast.
This mode is useful for CSV files generated by data scientists and similar. Strings 
are preserved in this mode but there is no benefit to loading strings in binary 
mode vs text mode.

If **iterative** is used, dekkai simply parses a file and iterates over all its rows
and invokes a callback for each, at the end of the iteration the data is immediately
unloaded so arbitrary access to rows and data is not possible. This method is useful
when a simple operation needs to be performed on the data in a single pass (sum, mean, 
average, etc).

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
        
        // text mode
        const table = await dekkai.tableFromLocalFile(fileInput.files[0]);
        
        // binary mode
        const table = await dekkai.binaryFromLocalFile(fileInput.files[0]);
        
        // iterate
        await dekkai.iterateLocalFile(fileInput.files[0], (row, index) => {
            // ...
        });
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
    
    // for text mode
    const table = await dekkai.tableFromLocalFile(file);
    
    // for binary mode
    const table = await dekkai.binaryFromLocalFile(file);
    
    // iterate
    await dekkai.iterateLocalFile(fileInput.files[0], (row, index) => {
        // ...
    });
}

main();
```

#### Accessing the data
Depending on which mode the data was loaded, there are slight differences on how it would
be accessed. If the data was loaded using **text mode**, each column has a configurable type, the
initial type of each column is auto-detected but it can be changed through the table's
`setColumnType`.

Another difference is that when accessed data from a **text mode** table, operations are 
asynchronous and therefore synchronization mechanisms (like `await`) must be used. This
usage is illustrated below.

Finally, the data can be accessed using the **iterative** method, which is also asynchronous. 

```javascript
/* data types can be set when in `text mode` */
table.setColumnType('Fly_date', 'string'); // overwrite the specified column's detected type
table.setColumnType(13, 'int'); // can be done by column index

/* iterate through all the rows in `text mode` */
await table.forEach(row => {
    console.log(row.valueByName('Origin_city')); // get a value by column name
    console.log(row.valueByNameTyped('Passengers')); // parse the value as its type
    console.log(row.valueByIndex(0)); // get a value by column index
    console.log(row.valueByIndexTyped(6)); // parse the value as its type
});

/* iterate through all the rows in `binary mode` */
table.forEach(row => {
    console.log(row.valueByName('Origin_city')); // get a value by column name
    console.log(row.valueByNameTyped('Passengers')); // parse the value as its type
    console.log(row.valueByIndex(0)); // get a value by column index
    console.log(row.valueByIndexTyped(6)); // parse the value as its type
});

/* get arbitrary row numbers */
for (let i = 100; i < 200 && i < table.rowCount; ++i) {
    /* in text mode */
    const row = await table.getRow(i);
    
    /* in binary mode */
    const row = table.getRow(i);
    
    let str = '';
    /* iterate over all the values in the row */
    row.forEach(value => {
        str += value + '\t';
    });
    console.log(str);
}

/* the `iterative` method */
await dekkai.iterateLocalFile(fileInput.files[0], (row, index) => {
    console.log(row.valueByName('Origin_city')); // get a value by column name
    console.log(row.valueByNameAsInt('Passengers')); // parse the value as an int
    console.log(row.valueByIndex(0)); // get a value by column index
    console.log(row.valueByIndexAsFloat(6)); // parse the value as a float
});
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
| JS (Web)  | dekkai                | Yes   | 3269ms        | 896ms           |
| JS (Node) | dekkai                | Yes   | 4291ms        | 936ms           |
|           |                       |       |               |                 |
| C++11     | fast-cpp-csv-parser   | Yes   | 1797ms        | N/A             |
| Go        | encoding/csv          | N/A   | 2135ms        | N/A             |
| Go        | weberc2/fastcsv       | N/A   | 3075ms        | N/A             |
| C++11     | AriaFallah/csv-parser | N/A   | 4011ms        | N/A             |
| JS (Web)  | Papa Parse 4          | No    | 11913ms       | N/A             |
| JS (Web)  | Papa Parse 4          | Yes   | 19508ms       | N/A             |
| JS (Node) | fast-csv              | N/A   | 35789ms       | N/A             |


