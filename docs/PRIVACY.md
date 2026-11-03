# Privacy Policy

> **Mailaxe** is an unofficial fork of [Aerion](https://github.com/hkdb/aerion) and is not affiliated with or endorsed by the Aerion project. This document is adapted from Aerion's original document; questions about Mailaxe should go to the Mailaxe repository, not to the Aerion developers.

**Last Updated:** October 30, 2026

## Introduction

Mailaxe ("we," "our," or "the Application") is an open-source desktop email client. Mailaxe source code and releases are hosted at [https://github.com/valba8/mailaxe](https://github.com/valba8/mailaxe). This Privacy Policy explains how Mailaxe handles your information. Because Mailaxe is a desktop application that runs entirely on your computer, our approach to privacy is fundamentally different from cloud-based services.

**Key Point:** Mailaxe does not operate any servers that collect, store, or process your data. All your information stays on your device.

## Information We Do Not Collect

Unlike many applications, Mailaxe:

- **Does not collect** any personal information on external servers
- **Does not transmit** your emails, contacts, or credentials to us
- **Does not use** analytics, telemetry, or tracking of any kind
- **Does not display** advertisements
- **Does not sell or share** any user data (we don't have access to it)

## Information Stored Locally on Your Device

Mailaxe stores the following information locally on your computer:

### Email Data
- Email messages synchronized from your email accounts
- Folder structure and organization
- Attachments (cached locally)
- Draft messages

### Account Credentials
- Email account configurations (server addresses, ports)
- Authentication tokens (OAuth tokens for Gmail, Outlook)
- App-specific passwords (stored in your system's secure keyring)

### Contacts
- Contact information synchronized from CardDAV, Google, or Microsoft accounts
- Used solely for email address autocomplete

### Application Settings
- Your preferences and settings
- Window size and position
- Theme preferences

**All of this data is stored in your local application data directory and never leaves your device except when communicating directly with your email providers.**

## Google API Services

Mailaxe releases do **not** include Google OAuth credentials. To use Gmail over OAuth you register your own OAuth client in your own Google Cloud project and enter it in Mailaxe (Settings → Accounts → OAuth Credentials); alternatively you can use IMAP with an app password. In both cases Mailaxe talks directly from your device to Google: no data passes through the Mailaxe developers.

### Google API Scopes Used

- **IMAP/SMTP Access** - To read, send, and manage your emails via standard IMAP/SMTP protocols (OAuth2 authenticated)
- **Google People API** - To access your contacts for email autocomplete

Mailaxe only uses Google data to provide email functionality to you, does not transfer Google data to third parties, does not use it for advertising and does not use it to train AI/ML models.

## Microsoft API Services

Mailaxe uses Microsoft Graph APIs to provide Outlook/Microsoft 365 integration. Mailaxe releases do not include a Microsoft OAuth client: you register your own (free) app in Azure and enter its client ID in Mailaxe.

### Microsoft API Scopes Used

- **Mail.ReadWrite** - To read, send, and manage your emails
- **Contacts.Read** - To access your contacts for email autocomplete
- **User.Read** - To access your basic profile information
- **offline_access** - To maintain your session

All Microsoft data is stored locally and used solely for email functionality.

## Data Security

Your data security depends on:

1. **Your device security** - Mailaxe stores data locally, so your device's security measures (disk encryption, password protection, etc.) protect your email data
2. **Secure connections** - All connections to email servers use TLS/SSL encryption
3. **System keyring** - Sensitive credentials are stored in your operating system's secure credential storage
4. **No cloud exposure** - Your data is never transmitted to our servers because we don't operate any

## Third-Party Services

Mailaxe only connects to services you explicitly configure:

- Your email provider (via IMAP/SMTP)
- Google APIs (if you use Gmail)
- Microsoft APIs (if you use Outlook/Microsoft 365)
- CardDAV servers (if you configure contact sync)

We do not integrate with any advertising networks, analytics services, or other third-party data collectors.

## Data Retention and Deletion

Since all data is stored locally on your device:

- **You control retention** - Data remains until you delete it
- **Uninstalling Mailaxe** - Removes the application but may leave data in your local application data directory
- **Complete removal** - Delete the Mailaxe data directory to remove all locally stored data

## Children's Privacy

Mailaxe is not directed at children under 13. We do not knowingly collect information from children. Since Mailaxe stores all data locally and does not transmit data to external servers, parental supervision of the device itself is the appropriate safeguard.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be reflected in the "Last Updated" date. Since Mailaxe is open source, you can review any changes in our public repository.

## Open Source Transparency

Mailaxe is open-source software. You can review exactly how we handle your data by examining our source code at [https://github.com/valba8/mailaxe](https://github.com/valba8/mailaxe).

## Contact Us

If you have questions about this Privacy Policy, please contact us at:

**GitHub Issues:** [https://github.com/valba8/mailaxe/issues](https://github.com/valba8/mailaxe/issues)
