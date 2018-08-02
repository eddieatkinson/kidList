const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let win;
let countInput

app.on('ready', function() {
  win = new BrowserWindow({});
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  win.on('closed', function() {
    app.quit();
  });
});

ipcMain.on('count:add', function(e, information) {
  console.log(information);
});