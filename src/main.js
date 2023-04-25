const { app, BrowserWindow, ipcMain } = require('electron')
const ioHook = require('iohook')
const spawn = require('child_process').spawn
const {mouse, Button, Point, sleep} = require('@nut-tree/nut-js')
const setIntervalAsync = require('set-interval-async').setIntervalAsync
const isDev = require('electron-is-dev')
const log = require('electron-log')
const path = require('path')
const {autoUpdater} = require('electron-updater')

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting')

log.transports.file.level = "info";

ioHook.start(false)

let VEHICLE_POS;
let IS_MACRO_ACTIVE = false;

ipcMain.on('vehicleChange', (e, arg) => {
  log.info(`Vehicle positions changed ${arg.position}`)

  VEHICLE_POS = arg.position;
})

ioHook.registerShortcut(
  [56, 37], // ALT-K
  (keys) => {
    if (IS_MACRO_ACTIVE) return;
    log.info("Started macro")

    IS_MACRO_ACTIVE = true;
  }
);

ioHook.registerShortcut(
  [56, 38], // ALT-L
  (keys) => {
    if (!IS_MACRO_ACTIVE) return;
    log.info("Stopped macro")

    IS_MACRO_ACTIVE = false;
  }
);


const createWindow = () => {
  const win = new BrowserWindow({
    width: 300,
    height: 70,
    x: 1919,
    y: 0,
    transparent: true,
    frame: false,
    resizable: false,
    fullscreenable: false,
    fullscreen: false,
    alwaysOnTop: true,
    icon: __dirname + "/assets/icon.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule : true,
      devTools: true
    },
  })

  win.loadFile('src/index.html')
}

let TIME_INTERVAL_STARTED = 0;

const macroInterval  = () => {
  if(!IS_MACRO_ACTIVE) return;
  if(!VEHICLE_POS) return;

  log.info('Started loop')
  TIME_INTERVAL_STARTED = 0;

  const intervalTimer = setInterval(() => {
    TIME_INTERVAL_STARTED += 1;
  }, 1)

  let pythonProcess;

  if(isDev){
    pythonProcess = spawn('python', ['./lib/image_search.py'])
    log.info('useDev')
  } else {
    log.info(path.join(process.resourcesPath, "lib", "image_search.py"))
    pythonProcess = spawn('python', [path.join(process.resourcesPath, "lib", "image_search.py"), ])
  }

  pythonProcess.stdout.on("data", async(data) => {
    log.info(`PYTHON: Vehicle icon data: ${data.toString()}`)

    try {
      const pos = JSON.parse(`[${data.toString()}]`)
      await mouse.setPosition(new Point(pos[0], pos[1]))
      await mouse.click(Button.LEFT)
      log.info("Clicked vehicle icon")

      await sleep(300)
      await mouse.setPosition(new Point(VEHICLE_POS[0], VEHICLE_POS[1]))
      await mouse.click(Button.LEFT)
      log.info(`Clicked vehicle pos${JSON.stringify(VEHICLE_POS)}`)

      // Click on empty area to close vehicle UI
      await mouse.setPosition(new Point(856, 163))
      await mouse.click(Button.LEFT)
      log.info('Interval time: ', TIME_INTERVAL_STARTED)
      clearInterval(intervalTimer)
    } catch(e) {
      log.error(e)
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    log.error(`PYTHON: stderr: ${data}`)
  });

  pythonProcess.on("close", (code) => {
    log.warn(`PYTHON: Child process exited with code ${code}`)
  });
}

setIntervalAsync(macroInterval, 1000)

let splashWindow;

function sendStatusToWindow(text) {
  log.info(text);
  if(splashWindow){
    splashWindow.webContents.send('message', text);
  }
}

app.on('window-all-closed', () => {
  app.quit()
})

app.whenReady().then(() => {
  createWindow()
  // logger is still not working properly
})

autoUpdater.on('update-not-available', () => {
  splashWindow.close()
  createWindow()
})

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update')
})

autoUpdater.on('update-available', () => {
  sendStatusToWindow('Update available')
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});