var argv = require('minimist')(process.argv.slice(2));
const { exception } = require('console');
const csv = require('csv-parser');
const fs = require('fs');

let csvfile = '../doc-bdms/i18n/web-bdms-translations.csv';
const output = './public/locale';

/**
 * To run this code:
 * node utils/update-translations.js
 */

if ('git' in argv) {
  throw new Error("Not yet implemented.");
}
else if ('csv' in argv) {
  csvfile = argv["csv"];
}

const results = [];
const languages = [];
const resources = {};

fs.createReadStream(csvfile)
  .pipe(csv())
  .on('headers', (headers) => {
    console.log("Parsing headers..");
    headers.slice(1).forEach(
      header => {
        resources[header] = {};
        languages.push(header);
      }
    );
    console.log(` > Found ${languages.length} languages (${languages})`);
  })
  .on('data', (data) => {
    results.push(data);
    languages.forEach(
      lang => {
        resources[lang][data.identifier] = data[lang];
      }
    );
  })
  .on('end', () => {

    console.log("CSV Parsed. creating json files.");

    languages.forEach(
      lang => {
        try {
          const lDir = `${output}/${lang}`;
          if (!fs.existsSync(lDir)) {
            fs.mkdirSync(lDir, { recursive: true });
          }

          const filePath = `${lDir}/common.json`;
          // console.log("Working on: ", lang, namespace, filePath);
          try {
            fs.writeFileSync(
              filePath,
              JSON.stringify(resources[lang], null, 2)
            );
          } catch (err) {
            console.error(err);
          }
        } catch (err) {
          console.log(err);
        }
      }
    );

    console.log("All done. Bye bye.");

  });
