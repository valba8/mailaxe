# Mailaxe

**Mailaxe** is an unofficial fork of [Aerion](https://github.com/hkdb/aerion), the open source, lightweight desktop email client. It keeps everything Aerion does and adds a handful of optional tweaks to the message viewer and the message list.

> [!IMPORTANT]
> Mailaxe is **not** affiliated with, sponsored by or endorsed by the Aerion project. Please report Mailaxe problems in [this repository's issues](https://github.com/valba8/aerion/issues), not to the Aerion developers.

<!-- Screenshot: replace with docs/images/mailaxe.png once available -->

## What's different from Aerion

Every new feature is **on by default** in a fresh install and can be turned off in **Settings → General**:

| Setting | What it does |
|---|---|
| **Collapse quoted text** | Hides the quoted previous messages at the bottom of replies behind a small `•••` button that shows or hides them. Works with Gmail, Outlook, Thunderbird, Yahoo, Proton, Zimbra and plain-text `>` quotes. Forwards and interleaved replies are left alone. |
| **Show View Source button** | On by default, as in Aerion. Turn it off to remove the button row below each message; View Source is always available from the message's right-click menu. |
| **Show checkboxes with a toolbar button** | Hides the selection checkboxes and adds a toolbar button in the message list that shows or hides them for every row. |
| **Account color as side strip** | In the unified inbox, shows each account's color as a full-height strip on the left of the row instead of a dot that can be mistaken for the unread marker. |
| **Show accent under the avatar** | Under the unread accent options: places the unread dot or bar under the sender's circle (the bar becomes horizontal). |
| **Group messages by date** | Splits the message list with headers such as Today, Yesterday, This week, Last week, This month and earlier months. Weeks start on your language's first day. |
| **Quick actions on hover** | Shows small Archive and Delete buttons under the star when hovering a message in the list. |

Other changes:

- **"Collapse all"** now collapses every message in a conversation (Aerion keeps the last one open).
- The vertical border to the left of the message body is gone.
- **Undo send**: after clicking Send, the composer closes and a notification counts down 6 seconds (configurable in Settings → Composer, 0 to turn off) with **Undo**, which reopens the message, and **Send now**. The detached composer window shows the countdown inside the window.
- **Notification area icon on Windows**: click it to show the window (handy with "Run in background"); right-click for Open and Quit.
- Different first-launch defaults: **Yaru (Dark)** theme, **native title bar**, dark composer body, contact photos and the unread accent in the message list, and messages marked as read **immediately** when opened. Everything can be changed in Settings.
- Mailaxe uses its **own data folder, keyring entries and single-instance lock**, so it can be installed next to Aerion without sharing accounts or settings.

## Download

Get the latest build from the [Releases page](https://github.com/valba8/aerion/releases):

- **Windows:** `Mailaxe-windows-setup-amd64.exe` (installer) or `Mailaxe-windows-amd64.exe` (portable).
- **Linux:** `mailaxe-linux-amd64.tar.gz` (binary; needs `webkit2gtk-4.1`).

Mailaxe builds are not code-signed, so Windows SmartScreen may warn the first time you run them ("More info → Run anyway").

## Gmail and Outlook setup

Mailaxe releases **do not include OAuth credentials** (those belong to the official Aerion builds, and distributing a Gmail OAuth app publicly requires Google's verification and a paid security assessment). Any IMAP/SMTP account works out of the box. For Gmail and Outlook you have two options:

### Option A: IMAP with an app password (easiest)

**Gmail**
1. Turn on [2-Step Verification](https://myaccount.google.com/signinoptions/two-step-verification) for your Google account.
2. Create an [app password](https://myaccount.google.com/apppasswords) and copy it.
3. In Mailaxe, add the account as a regular IMAP account: IMAP `imap.gmail.com:993` (SSL/TLS), SMTP `smtp.gmail.com:465` (SSL/TLS), user = your full address, password = the app password.

**Outlook / Microsoft 365:** Microsoft has been phasing out password-based IMAP for Outlook.com and most Microsoft 365 tenants, so Option B is usually required for Microsoft accounts.

### Option B: your own OAuth client

You create a free OAuth client with Google and/or Microsoft and paste it into **Settings → Accounts → OAuth Credentials (advanced)**. Then add the account normally and choose Google or Microsoft sign-in.

**Google**
1. Open the [Google Cloud console](https://console.cloud.google.com/) and create a project.
2. **APIs & Services → Library**: enable **Gmail API** and **People API**.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform): fill in the app name and your email, choose **External**.
4. **Audience → Test users**: add the Gmail addresses you will use.
5. **Clients → Create client → Desktop app**. Copy the **Client ID** and **Client secret**.
6. Paste both into **Google Mail** in Mailaxe's OAuth Credentials section.

While the Google app is in *Testing* mode, Google expires the sign-in every 7 days. Clicking **Publish app** (no verification needed for personal use) avoids that; you will still see an "unverified app" warning when signing in: choose **Advanced → Go to (your app)**.

**Microsoft**
1. Open [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade) and click **New registration**.
2. Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**.
3. Redirect URI: platform **Public client/native (mobile & desktop)**, value `http://localhost`.
4. **API permissions → Add a permission**, delegated: `IMAP.AccessAsUser.All`, `SMTP.Send`, `offline_access`, `openid`, `email`.
5. **Authentication → Allow public client flows: Yes**.
6. Copy the **Application (client) ID** into **Microsoft Mail** in Mailaxe's OAuth Credentials section (no secret needed).

## Building from source

Mailaxe builds exactly like Aerion (Go, Node.js and the [Wails v2](https://wails.io) CLI). See [docs/BUILD.md](docs/BUILD.md). On Windows:

```powershell
go install github.com/wailsapp/wails/v2/cmd/wails@v2.16.0
wails build -clean
```

The binary ends up in `build/bin/mailaxe.exe`. To bake your own OAuth client into a local build, put it in a `.env.local` file (see [.env.example](.env.example)); that file is git-ignored and must never be committed.

## Contributing

Pull requests are welcome, including finished features you have already implemented: no prior approval needed. New features and visual changes should come with a Settings option that is off by default. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits and license

Mailaxe is built on top of [Aerion](https://github.com/hkdb/aerion) by hkdb and the Aerion contributors. Aerion's original README, with its full feature list and contributors, is kept in [docs/AERION_README.md](docs/AERION_README.md).

Mailaxe, like Aerion, is licensed under the [Apache License 2.0](LICENSE). See [NOTICE](NOTICE) for attribution and a summary of the modifications. "Aerion" is used only to describe where this software comes from.
