const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let win;
let addWindow;

process.env.NODE_ENV = 'production';

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

function displayFileNameRequirements() {
  addWindow = new BrowserWindow({
    width: 436,
    height: 200,
    title: 'File Name Requirements',
  });
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'fileNameRequirements.html'),
    protocol: 'file:',
    slashes: true,
  }));
  addWindow.on('close', function() {
    addWindow = null;
  });
}

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
          displayFileNameRequirements();
        }
      }
    ]
  }
]

// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload',
      },
    ]
  })
}
