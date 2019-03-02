# HugeCSV
View huge CSV files in the browser

**Instructions:**
- Checkout this repo
- Install [yarn](https://yarnpkg.com/en/) if needed.
- On the command line navigate to the repo's folder
- Run `yarn install`
- Run `yarn start` and wait for project to build
- In Chrome (has to be chrome for now) navigate to `localhost:8091`
- Load a CSV huge CSV file!

## Limitations
- Only `,` is supported as separator.
- Only `"` is supported as delimiter
- At the moment can't display all rows due to a bug in TableView 

## Next Steps
- Add row counter column
- Improve scrolling performance
- Display full file
