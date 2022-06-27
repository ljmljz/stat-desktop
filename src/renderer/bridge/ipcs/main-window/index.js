import { ipcRenderer } from 'electron'

import { IPC } from 'shared/constants'

export function loadFile() {
  const channel = IPC.WINDOWS.MAIN.LOAD_FILE

  ipcRenderer.invoke(channel)
}
