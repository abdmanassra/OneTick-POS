// const setupEvents = require('./installers/setupEvents')
// if (setupEvents.handleSquirrelEvent()) {
//   return;
// }

const server = require('./server');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';



const contextMenu = require('electron-context-menu');

let mainWindow
let AppTray = null;

const iconPath = path.join(__dirname, 'assets/images/appIcon.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 1200,
    frame: false,
    minWidth: 1200,
    minHeight: 750,
    webPreferences: {
      nodeIntegration: true,
    },
    iconPath
  });

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(
    `file://${path.join(__dirname, 'index.html')}`
  )

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

console.log("hi");
console.log(app);
app.removeAllListeners('ready')
app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})



ipcMain.on('app-quit', (evt, arg) => {
  app.quit()
})


ipcMain.on('app-reload', (event, arg) => {
  mainWindow.reload();
});



contextMenu({
  prepend: (params, browserWindow) => [

    {
    label: 'DevTools',
    click(item, focusedWindow) {
     focusedWindow.toggleDevTools();
    }
    },
    {
      label: "Reload",
      click() {
        mainWindow.reload();
      }
      // },
      // {  label: 'Quit',  click:  function(){
      //    mainWindow.destroy();
      //     mainWindow.quit();
      // } 
    }
  ],

});



