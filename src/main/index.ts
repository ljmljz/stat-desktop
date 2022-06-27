import { app } from 'electron'
import { ipcMain } from 'electron'
import { IPC } from 'shared/constants'

import { makeAppSetup, makeAppWithSingleInstanceLock } from './factories'
import { MainWindow, registerAboutWindowCreationByIPC } from './windows'

makeAppWithSingleInstanceLock(async () => {
  await app.whenReady()
  await makeAppSetup(MainWindow)

  registerAboutWindowCreationByIPC()

  const channel = IPC.WINDOWS.MAIN.LOAD_FILE
  ipcMain.handle(channel, () => {
    console.log(channel)
  })
})
