//go:build !windows

package app

// The notification area icon is only implemented on Windows. On macOS the
// systray library conflicts with Wails' own AppKit run loop.
func (a *App) startTray() {}

func (a *App) stopTray() {}
