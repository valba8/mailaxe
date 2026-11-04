package message

import (
	"testing"
	"time"

	"github.com/hkdb/aerion/internal/database"
)

func seedThreadMessage(t *testing.T, s *Store, id, folderID, messageID string, uid uint32, date time.Time) {
	t.Helper()
	m := &Message{ID: id, AccountID: "acct-1", FolderID: folderID, UID: uid, MessageID: messageID, ThreadID: "thread@example.com", Date: date}
	if err := s.Create(m); err != nil {
		t.Fatalf("Create %s: %v", id, err)
	}
}

func seedFolder(t *testing.T, db *database.DB, id, name, folderType string) {
	t.Helper()
	if _, err := db.Exec(
		`INSERT INTO folders (id, account_id, name, path, folder_type) VALUES (?, ?, ?, ?, ?)`,
		id, "acct-1", name, name, folderType,
	); err != nil {
		t.Fatalf("seed folder %s: %v", id, err)
	}
}

// A new reply brings an archived thread back to the inbox: the archived
// messages show as context, and only rows outside the viewed folder that came
// from Archive or All Mail are marked so.
func TestGetConversationIncludesArchivedContext(t *testing.T) {
	s, db := newExpandCopiesTestStore(t)
	seedFolder(t, db, "archive-1", "Archive", "archive")
	seedFolder(t, db, "all-1", "All Mail", "all")
	seedFolder(t, db, "spam-1", "Spam", "spam")

	start := time.Date(2026, 11, 1, 10, 0, 0, 0, time.UTC)
	seedThreadMessage(t, s, "archived", "archive-1", "first@example.com", 1, start)
	seedThreadMessage(t, s, "sent", "sent-1", "reply@example.com", 2, start.Add(time.Hour))
	seedThreadMessage(t, s, "new", "inbox-1", "new@example.com", 3, start.Add(2*time.Hour))
	// The same email in All Mail and Inbox collapses to the viewed folder's copy.
	seedThreadMessage(t, s, "new-all", "all-1", "new@example.com", 4, start.Add(2*time.Hour))

	c, err := s.GetConversation("thread@example.com", "inbox-1")
	if err != nil {
		t.Fatalf("GetConversation: %v", err)
	}
	want := []struct {
		id      string
		context bool
	}{{"archived", true}, {"sent", false}, {"new", false}}
	if len(c.Messages) != len(want) {
		t.Fatalf("got %d messages, want %d", len(c.Messages), len(want))
	}
	for i, w := range want {
		if c.Messages[i].ID != w.id || c.Messages[i].ContextOnly != w.context {
			t.Errorf("message %d: got %s context=%v, want %s context=%v", i, c.Messages[i].ID, c.Messages[i].ContextOnly, w.id, w.context)
		}
	}

	// Viewing the archive itself: its messages are the folder's own.
	c, err = s.GetConversation("thread@example.com", "archive-1")
	if err != nil {
		t.Fatalf("GetConversation archive: %v", err)
	}
	for _, m := range c.Messages {
		if m.ID == "archived" && m.ContextOnly {
			t.Error("a message in the viewed folder must not be context")
		}
	}

	// Spam keeps its narrow scope: archived mail doesn't bleed into it.
	seedThreadMessage(t, s, "spam", "spam-1", "spam@example.com", 5, start.Add(3*time.Hour))
	c, err = s.GetConversation("thread@example.com", "spam-1")
	if err != nil {
		t.Fatalf("GetConversation spam: %v", err)
	}
	for _, m := range c.Messages {
		if m.ContextOnly {
			t.Errorf("spam view included context message %s", m.ID)
		}
	}
}
