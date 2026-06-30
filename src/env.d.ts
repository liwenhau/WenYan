/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_NETEASE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface WenyanDesktopState {
  wallpaperActive: boolean
  launchAtLogin: boolean
  platform: string
  mainWindowMaximized: boolean
  neteaseApiBase: string
  wallpaperOptions: WenyanWallpaperOptions
}

interface WenyanWallpaperOptions {
  scene: string
  quoteId: number
  lowPower: boolean
  passThroughMouse: boolean
  autoMusic: boolean
}

interface WenyanDesktopBridge {
  getState: () => Promise<WenyanDesktopState>
  setWallpaperMode: (options: WenyanWallpaperOptions) => Promise<WenyanDesktopState>
  exitWallpaperMode: () => Promise<WenyanDesktopState>
  minimizeWindow: () => Promise<WenyanDesktopState>
  toggleMaximizeWindow: () => Promise<WenyanDesktopState>
  closeWindow: () => Promise<WenyanDesktopState>
  setLaunchAtLogin: (enabled: boolean) => Promise<WenyanDesktopState>
  onStateChanged: (callback: (state: WenyanDesktopState) => void) => () => void
}

interface Window {
  wenyanDesktop?: WenyanDesktopBridge
}
