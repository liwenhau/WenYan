param(
  [Parameter(Mandatory = $true)]
  [int]$WallpaperHwnd
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public static class NativeWallpaper {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern IntPtr FindWindowEx(IntPtr parentHandle, IntPtr childAfter, string className, string windowTitle);

  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc enumProc, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

  [DllImport("user32.dll", SetLastError = true)]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$progman = [NativeWallpaper]::FindWindow("Progman", $null)
if ($progman -eq [IntPtr]::Zero) {
  throw "找不到 Windows 桌面窗口 Progman。"
}

$result = [UIntPtr]::Zero
[NativeWallpaper]::SendMessageTimeout($progman, 0x052C, [UIntPtr]::Zero, [IntPtr]::Zero, 0, 1000, [ref]$result) | Out-Null
Start-Sleep -Milliseconds 180

$workerw = [IntPtr]::Zero
$enumCallback = [NativeWallpaper+EnumWindowsProc]{
  param([IntPtr]$topHandle, [IntPtr]$lParam)

  $shellView = [NativeWallpaper]::FindWindowEx($topHandle, [IntPtr]::Zero, "SHELLDLL_DefView", $null)
  if ($shellView -ne [IntPtr]::Zero) {
    $script:workerw = [NativeWallpaper]::FindWindowEx([IntPtr]::Zero, $topHandle, "WorkerW", $null)
  }
  return $true
}

[NativeWallpaper]::EnumWindows($enumCallback, [IntPtr]::Zero) | Out-Null

if ($workerw -eq [IntPtr]::Zero) {
  $workerw = $progman
}

$wallpaperPtr = [IntPtr]::new($WallpaperHwnd)
[NativeWallpaper]::SetParent($wallpaperPtr, $workerw) | Out-Null
[NativeWallpaper]::SetWindowPos($wallpaperPtr, [IntPtr]::Zero, 0, 0, 0, 0, 0x0001 -bor 0x0002 -bor 0x0010 -bor 0x0040) | Out-Null
[NativeWallpaper]::ShowWindow($wallpaperPtr, 5) | Out-Null
