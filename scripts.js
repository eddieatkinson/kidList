const electron = require('electron');
const { map, forEach, uniq, isEmpty } = require('lodash');
const { ipcRenderer } = electron;
const { dialog } = electron.remote; // Load remote compnent that contains the dialog dependency
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

const fullFileNameArray = [];
let fileLocation;

function getNames(fileArray) {
  
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
  const fileNameWithExtension = wholeFileNameArray.pop();
  
  
  fileLocation = wholeFileNameArray.join('/');
  
  return fileNameWithExtension;
}

function removeExtension(fileName) {
  const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, '');
  return nameWithoutExtension;
}

function removeJPEGNumber(fileName) {
  const justName = fileName.replace(/\-.+/, ''); // Remove anything after the first dash encaountered
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

function createGroupArray(countArray) {
  let groupNumber = 1;
  const groupArray = [];
  forEach(countArray, (count) => {
    for (let i = 0; i < count; i++) {
      groupArray.push(groupNumber);
    }
    groupNumber++;
  });
  return groupArray;
}

function createImageData(nameArray, groupArray, date, school) {
  let imageDataContent = `Filename,FirstName,LastName,FullName,GroupTest,Class,Packages,ShootDate,SchoolName\n`;
  forEach(fullFileNameArray, (name, index) => {
    const nameInformation = separateNameAndClass(nameArray[index]);
    const className = nameInformation[0];
    const nameOnly = nameInformation[1];
    imageDataContent += `${name},${nameOnly},,${nameOnly},${groupArray[index]},${className},,${date},${school}\n`;
  });
  return imageDataContent;
}

function separateNameAndClass(fileName) {
  const fileNameArray = fileName.split(' ');
  const className = fileNameArray.shift();
  const nameOnly = fileNameArray.join(' ');
  return [className, nameOnly];
}

$(document).ready(() => {
  let uniqueNameArray = [];
  let countArray;
  let nameArray;
  $('#readFiles').click(() => {
    dialog.showOpenDialog({ properties: [
        'openFile', 'multiSelections',
      ]}, (fileNames) => {
          nameArray = getNames(fileNames);
          uniqueNameArray = uniq(nameArray);
          countArray = getCount(nameArray, uniqueNameArray);
          
          
        });
  });
  $('#submit').click(() => {
    const count = $('#count').val();
    const school = $('#school').val();
    const date = $('#date').val();
    
    if (isEmpty(uniqueNameArray)) {
      alert('Please select files');
    } else if (!count || !school || !date) {
      alert('All fields are required');
    } else {
      const filesWithMultiples = addMultiples(count, uniqueNameArray, countArray);
      const commaSeparatedClassArray = separateClassWithComma(filesWithMultiples);
      
      const filePath = `${fileLocation}/${school}`;
      const spreadsheetContent = createSpreadsheet(commaSeparatedClassArray);
      fs.writeFile(`${filePath}.csv`, spreadsheetContent, (error) => {
        if(error) {
          alert(`An error occured: ${error.message}`);
        } else {
          alert('File successfully created!');
        }
      });

      const includeImageData = $('#imageData:checked').val();

      if (includeImageData) {
        const groupArray = createGroupArray(countArray);
        const imageDataContent = createImageData(nameArray, groupArray, date, school);
        fs.writeFile(`${filePath}.txt`, imageDataContent, (error) => {
          if (error) {
            alert(`An error occured when creating image data file: ${error.message}`);
          }
        })
      }
    }
  });
});