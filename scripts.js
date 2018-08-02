const electron = require('electron');
const { ipcRenderer } = electron;
const { dialog } = electron.remote; // Load remote compnent that contains the dialog dependency
const fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

$(document).ready(() => {
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
    if (!file || !count || !school || !date) {
      alert("All fields are required");
    } else {
      console.log(information);
      ipcRenderer.send('count:add', information);
    }
  });
});