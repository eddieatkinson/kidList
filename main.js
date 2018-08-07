const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let win;
let countInput

app.on('ready', function() {
  win = new BrowserWindow({ width: 800, height: 500 });
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));
  win.on('closed', function() {
    app.quit();
  });
  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  //Insert menu
  Menu.setApplicationMenu(mainMenu);
});

ipcMain.on('count:add', function(e, information) {
  console.log(information);
});

const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        },
      },
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'File Name Requirements',
        click() {
          console.log('File name requirements');
        }
      }
    ]
  }
]