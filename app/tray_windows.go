//go:build windows

package app

import (
	"runtime"

	"fyne.io/systray"
	"github.com/hkdb/aerion/internal/logging"
)

// trayLabels holds the tray menu texts per UI language; the frontend i18n
// files are not available to the backend.
var trayLabels = map[string][2]string{
	"en":    {"Open Mailaxe", "Quit"},
	"cs":    {"Otevřít Mailaxe", "Ukončit"},
	"de":    {"Mailaxe öffnen", "Beenden"},
	"fr":    {"Ouvrir Mailaxe", "Quitter"},
	"it":    {"Apri Mailaxe", "Esci"},
	"ja":    {"Mailaxe を開く", "終了"},
	"nb":    {"Åpne Mailaxe", "Avslutt"},
	"pl":    {"Otwórz Mailaxe", "Zakończ"},
	"pt-BR": {"Abrir o Mailaxe", "Sair"},
	"tr":    {"Mailaxe'i aç", "Çık"},
	"vi":    {"Mở Mailaxe", "Thoát"},
	"zh-CN": {"打开 Mailaxe", "退出"},
	"zh-HK": {"開啟 Mailaxe", "結束"},
	"zh-TW": {"開啟 Mailaxe", "結束"},
}

// startTray shows the Mailaxe icon in the Windows notification area. Left
// click shows the window; the right-click menu offers Open and Quit, so the
// app stays reachable while it runs in the background.
func (a *App) startTray() {
	if len(a.TrayIcon) == 0 {
		return
	}

	labels := trayLabels["en"]
	if lang, _ := a.settingsStore.GetLanguage(); lang != "" {
		if l, ok := trayLabels[lang]; ok {
			labels = l
		}
	}

	onReady := func() {
		systray.SetIcon(a.TrayIcon)
		systray.SetTooltip("Mailaxe")
		systray.SetOnTapped(a.ShowWindow)

		open := systray.AddMenuItem(labels[0], "")
		systray.AddSeparator()
		quit := systray.AddMenuItem(labels[1], "")

		go func() {
			defer recoverPanic("tray", "menu")
			for {
				select {
				case <-open.ClickedCh:
					a.ShowWindow()
				case <-quit.ClickedCh:
					a.QuitApp()
					return
				}
			}
		}()
	}

	// The tray window and its message loop must live on the same OS thread
	go func() {
		defer recoverPanic("tray", "loop")
		runtime.LockOSThread()
		systray.Run(onReady, nil)
	}()

	log := logging.WithComponent("tray")
	log.Info().Msg("Notification area icon started")
}

func (a *App) stopTray() {
	if len(a.TrayIcon) == 0 {
		return
	}
	systray.Quit()
}
