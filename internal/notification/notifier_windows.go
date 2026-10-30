//go:build windows

package notification

import (
	"context"
	"fmt"
	"sync"
	"time"

	"git.sr.ht/~jackmordaunt/go-toast/v2/wintoast"
	"github.com/hkdb/aerion/internal/logging"
	"github.com/rs/zerolog"
	"golang.org/x/sys/windows/registry"
)

const (
	windowsAppID       = "io.github.valba8.Mailaxe"
	windowsDisplayName = "Mailaxe"
	// Own activation GUID so Mailaxe and Aerion don't share a COM activator
	windowsGUID = "{F29AFA96-9241-4CD4-9EFB-753357C4F805}"
)

// windowsNotifier uses Windows Toast notifications with COM activation
// for click handling via the go-toast/v2 library.
type windowsNotifier struct {
	appName       string
	clickHandler  ClickHandler
	notifications map[string]NotificationData
	mu            sync.RWMutex
	log           zerolog.Logger
	idCounter     uint64
	initialized   bool
}

func newPlatformNotifier(appName string, useDirectDBus bool) Notifier {
	// useDirectDBus is Linux-only, ignored on Windows
	return &windowsNotifier{
		appName:       appName,
		notifications: make(map[string]NotificationData),
		log:           logging.WithComponent("notification"),
	}
}

func (n *windowsNotifier) Start(ctx context.Context) error {
	// Register app data with Windows Runtime (writes to registry, idempotent)
	if err := wintoast.SetAppData(wintoast.AppData{
		AppID: windowsAppID,
		GUID:  windowsGUID,
	}); err != nil {
		// Non-fatal: notifications may still display but clicks may not route back
		n.log.Warn().Err(err).Msg("Failed to register Windows app data (notifications may not support click handling)")
	}
	n.setDisplayName()

	// Set up the activation callback for toast interactions.
	// invokedArgs contains our notification ID (set in the toast launch attribute).
	wintoast.SetActivationCallback(func(appUserModelId string, invokedArgs string, userData []wintoast.UserData) {
		n.mu.RLock()
		data, exists := n.notifications[invokedArgs]
		handler := n.clickHandler
		n.mu.RUnlock()

		if !exists {
			n.log.Debug().Str("args", invokedArgs).Msg("Notification data not found for activation")
			return
		}

		if handler != nil {
			n.log.Info().
				Str("accountId", data.AccountID).
				Str("folderId", data.FolderID).
				Str("threadId", data.ThreadID).
				Msg("Notification clicked, invoking handler")
			handler(data)
		}

		// Clean up
		n.mu.Lock()
		delete(n.notifications, invokedArgs)
		n.mu.Unlock()
	})

	n.initialized = true
	n.log.Info().Msg("Windows notification support started (Toast/COM)")
	return nil
}

// setDisplayName overrides the toast header text. go-toast registers the AppID
// itself as DisplayName and never updates an existing value, so the header
// would show "io.github.valba8.Mailaxe". CustomActivator is rewritten as well
// so installs registered with an older GUID pick up the current one.
func (n *windowsNotifier) setDisplayName() {
	key, _, err := registry.CreateKey(registry.CURRENT_USER, `SOFTWARE\Classes\AppUserModelId\`+windowsAppID, registry.SET_VALUE)
	if err != nil {
		n.log.Debug().Err(err).Msg("Failed to open AppUserModelId registry key")
		return
	}
	defer key.Close()
	if err := key.SetStringValue("DisplayName", windowsDisplayName); err != nil {
		n.log.Debug().Err(err).Msg("Failed to set notification display name")
	}
	if err := key.SetStringValue("CustomActivator", windowsGUID); err != nil {
		n.log.Debug().Err(err).Msg("Failed to set notification activator")
	}
}

func (n *windowsNotifier) Stop() {
	n.log.Info().Msg("Windows notification listener stopped")
}

// generateNotificationID creates a unique notification ID for tracking
func (n *windowsNotifier) generateNotificationID() string {
	n.mu.Lock()
	n.idCounter++
	id := fmt.Sprintf("aerion-notif-%d-%d", time.Now().Unix(), n.idCounter)
	n.mu.Unlock()
	return id
}

func (n *windowsNotifier) Show(notif Notification) (uint32, error) {
	if !n.initialized {
		n.log.Debug().Str("title", notif.Title).Msg("Notification skipped (not initialized)")
		return 0, nil
	}

	id := n.generateNotificationID()

	// Store notification data for click handling
	n.mu.Lock()
	n.notifications[id] = notif.Data
	n.mu.Unlock()

	// Build toast XML with launch attribute containing our notification ID.
	// The launch value is passed back as invokedArgs in the activation callback.
	xml := fmt.Sprintf(`<toast activationType="foreground" launch="%s">
  <visual>
    <binding template="ToastGeneric">
      <text>%s</text>
      <text>%s</text>
    </binding>
  </visual>
</toast>`, xmlEscape(id), xmlEscape(notif.Title), xmlEscape(notif.Body))

	if err := wintoast.Push(windowsAppID, xml, wintoast.PowershellFallback); err != nil {
		// Clean up stored data on failure
		n.mu.Lock()
		delete(n.notifications, id)
		n.mu.Unlock()

		n.log.Debug().Err(err).Str("title", notif.Title).Msg("Failed to show Windows toast notification")
		return 0, err
	}

	n.log.Debug().Str("id", id).Str("title", notif.Title).Msg("Notification shown via Windows Toast")

	// Return a hash of the ID as uint32 for API compatibility
	var numericID uint32
	for _, c := range id {
		numericID = numericID*31 + uint32(c)
	}
	return numericID, nil
}

func (n *windowsNotifier) SetClickHandler(handler ClickHandler) {
	n.mu.Lock()
	n.clickHandler = handler
	n.mu.Unlock()
}

// xmlEscape escapes special characters for XML attributes and text content
func xmlEscape(s string) string {
	var result []byte
	for i := 0; i < len(s); i++ {
		switch s[i] {
		case '&':
			result = append(result, []byte("&amp;")...)
		case '<':
			result = append(result, []byte("&lt;")...)
		case '>':
			result = append(result, []byte("&gt;")...)
		case '"':
			result = append(result, []byte("&quot;")...)
		case '\'':
			result = append(result, []byte("&apos;")...)
		default:
			result = append(result, s[i])
		}
	}
	return string(result)
}
