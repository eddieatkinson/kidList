const electron = require('electron');
const { map, forEach, uniq, isEmpty } = require('lodash');
const { ipcRenderer } = electron;
const { dialog } = electron.remote; // Load remote compnent that contains the dialog dependency
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

const fullFileNameArray = [];
let fileLocation;

function getNames(fileArray) {
  // console.log(fileArray);
  const nameArray = map(fileArray, (file) => {
    const fileNameWithExtension = getNameWithExtension(file);
    fullFileNameArray.push(fileNameWithExtension);
    const nameWithoutExtension = removeExtension(fileNameWithExtension);
    const justName = removeJPEGNumber(nameWithoutExtension);
    return justName;
  });
  return nameArray;
}

function getNameWithExtension(wholeFileName) {
  const wholeFileNameArray = wholeFileName.split('/');
  // const lastElement = wholeFileNameArray.length - 1;
  // console.log(wholeFileNameArray);
  const fileNameWithExtension = wholeFileNameArray.pop();
  // console.log(wholeFileNameArray);
  // console.log(wholeFileNameArray.join('/'));
  fileLocation = wholeFileNameArray.join('/');
  // console.log(fileNameWithExtension);
  return fileNameWithExtension;
}

function removeExtension(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  return nameWithoutExtension;
}

function removeJPEGNumber(fileName) {
  const justName = fileName.replace(/\-.+/, ""); // Remove anything after the first dash encaountered
  return justName;
}

function getCount(nameArray, uniqueNameArray) {
  let i = 0;
  let count = 0;
  const lastNameIndex = nameArray.length - 1;
  const lastUniqueNameIndex = uniqueNameArray.length - 1;
  const countArray = [];
  forEach(nameArray, (name, index) => {
    if (name === uniqueNameArray[i]) {
      count++;
      if (lastNameIndex === index && lastUniqueNameIndex === i) {
        countArray.push(count);
      }
    } else {
      countArray.push(count);
      i++;
      count = 1;
    }
  });
  return countArray;
}

function addMultiples(count, uniqueNameArray, countArray) {
  const filesWithMultiples = [];
  forEach(countArray, (currentCount, index) => {
    const numberOfProofs = Math.ceil(currentCount / count);
    for (let i = 0; i < numberOfProofs; i++) {
      filesWithMultiples.push(uniqueNameArray[index]);
    }
  });
  return filesWithMultiples;
}

function separateClassWithComma(filesWithMultiples) {
  const commaSeparatedClassArray = map(filesWithMultiples, (file) => {
    const fileWithComma = file.replace(' ', ',');
    return fileWithComma;
  });
  return commaSeparatedClassArray;
}

function createSpreadsheet(commaSeparatedClassArray) {
  const spreadsheetContent = commaSeparatedClassArray.join('\n');
  return spreadsheetContent;
}

$(document).ready(() => {
  let uniqueNameArray = [];
  let countArray;
  $('#readFiles').click(() => {
    dialog.showOpenDialog({ properties: [
        'openFile', 'multiSelections',
      ]}, (fileNames) => {
          const nameArray = getNames(fileNames);
          uniqueNameArray = uniq(nameArray);
          countArray = getCount(nameArray, uniqueNameArray);
          // console.log(uniqueNameArray);
          // console.log(countArray);
        });
  });
  $("#submit").click(() => {
    const file = $("#file").val();
    const count = $("#count").val();
    const school = $("#school").val();
    const date = $("#date").val();
    const information = {
      file,
      count,
      school,
      date,
    };
    if (isEmpty(uniqueNameArray)) {
      alert("Please select files");
    } else if (!count || !school || !date) {
      alert("All fields are required");
    } else {
      console.log(fullFileNameArray);
      console.log(fileLocation);
      // console.log(information);
      const filesWithMultiples = addMultiples(count, uniqueNameArray, countArray);
      // console.log(filesWithMultiples);
      const commaSeparatedClassArray = separateClassWithComma(filesWithMultiples);
      // console.log(commaSeparatedClassArray);
      const spreadsheetContent = createSpreadsheet(commaSeparatedClassArray);
      ipcRenderer.send('count:add', information);
      fs.writeFile(`${fileLocation}/${school}.csv`, spreadsheetContent, (error) => {
        if(error) {
          alert(`An error occured: ${error.message}`);
        } else {
          alert('File successfully created!');
        }
      });
    }
  });
});