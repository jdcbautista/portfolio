import fs from 'fs';
import path from 'path';
// import csv from 'csv-parser'

const directoryPath = '../../public/art/Firestore';

const csvFilePath = './output.csv';
const jsonFilePath = './output.json';
const jsonFilePath2 = './output2.json';

// Regular expression pattern to extract values from filenames
const pattern = /(\d{4})_([^_]+)_(\d+)x(\d+)\.(\w+)/;

// Function to convert CamelCase to spaced string
function camelCaseToSpacedString(str) {
    return str.replace(/([A-Z]+)(?=[A-Z]?[a-z]|\b)/g, ' $1').trim();
}

// Function to read directory and process files
fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    // Arrays to store CSV lines and JSON objects
    let csvLines = [];
    let jsonObject = [];
    let jsonObjectByCode = {};
    files.forEach(function (file) {
        // Extracting values using regular expression
        const matches = file.match(pattern);
        if (matches) {
            // Constructing CSV line
            const code = matches[1];
            const name = camelCaseToSpacedString(matches[2]);
            const fWidth = matches[3];
            const fHeight = matches[4];
            const fileType = matches[5];
            const filename = file; // Filename in its original form
            const csvLine = `${code},${name},${fWidth},${fHeight},${fileType},${filename}`;
            csvLines.push(csvLine);

            // Constructing JSON object
            const entry = {
                Code: parseInt(code),
                Name: name,
                FWidth: parseInt(fWidth),
                FHeight: parseInt(fHeight),
                FileType: fileType,
                Filename: filename
            };
            let obj = {}
            obj[code] = entry
            jsonObjectByCode[code] = entry;
            jsonObject.push(obj);

        } else {
            console.log('Skipping file:', file);
        }
    });
    // Writing CSV content to file
    const csvContent = csvLines.join('\n');
    fs.writeFile(csvFilePath, csvContent, function (err) {
        if (err) throw err;
        console.log('CSV file has been saved.');
    });
    // Writing JSON object to file
    fs.writeFile(jsonFilePath, JSON.stringify(jsonObject, null, 2), function (err) {
        if (err) throw err;
        console.log('JSON file has been saved.');
    });
    // Writing JSON object to file
    fs.writeFile(jsonFilePath2, JSON.stringify(jsonObjectByCode, null, 2), function (err) {
        if (err) throw err;
        console.log('JSON file has been saved.');
    });
});