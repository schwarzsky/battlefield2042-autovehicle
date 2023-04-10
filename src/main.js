const { app, BrowserWindow, ipcMain } = require('electron')
const ioHook = require('iohook')
const spawn = require('child_process').spawn
const {mouse, Button, Point, screen} = require('@nut-tree/nut-js')
const setIntervalAsync = require('set-interval-async').setIntervalAsync;
const isDev = require('electron-is-dev')
const log = require('electron-log')
const path = require('path')

log.transports.file.level = "info";

ioHook.on('mouseclick', (e) => {
  //console.log(e)
})

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
    log.info("Started macro");

    IS_MACRO_ACTIVE = true;
  }
);

ioHook.registerShortcut(
  [56, 38], // ALT-L
  (keys) => {
    if (!IS_MACRO_ACTIVE) return;
    log.info("Stopped macro");

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

const macroInterval  = async () => {
  if(!IS_MACRO_ACTIVE) return;
  if(!VEHICLE_POS) return;

  log.info('Started loop')

  let pythonProcess;

  if(isDev){
    pythonProcess = spawn('python', ['./lib/image_search.py']);
    log.info('useDev')
  } else {
    log.info(path.join(process.resourcesPath, "lib", "image_search.py"))
    pythonProcess = spawn('python', [path.join(process.resourcesPath, "lib", "image_search.py"), ]);
  }

  pythonProcess.stdout.on("data", async function (data) {
    log.info(data.toString())

    try {
      const pos = JSON.parse(`[${data.toString()}]`)
      await mouse.setPosition(new Point(pos[0], pos[1]))
      await mouse.click(Button.LEFT)
      log.info("Clicked vehicle icon")
      
      setTimeout(async () => {
        const pixelAt = await screen.colorAt(new Point(472, 528))
        await mouse.setPosition(new Point(VEHICLE_POS[0], VEHICLE_POS[1]))
        await mouse.click(Button.LEFT)
        log.info(`Clicked vehicle pos${JSON.stringify(VEHICLE_POS)}`)
      }, 300)

      setTimeout(async () => {
        await mouse.setPosition(new Point(856, 163))
        await mouse.click(Button.LEFT)
      }, 800)
    } catch(e) {
      log.error(e)
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    log.error(`-PYTHON stderr: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    log.warn(`-PYTHON child process exited with code ${code}`);
  });
}

setIntervalAsync(macroInterval, 1000)

app.whenReady().then(() => {
  createWindow()
})