/**
 * Signature management utilities for the email composer
 */
// @ts-ignore - Wails generated imports
import { account } from '../../../../wailsjs/go/models'

// Re-export the Identity type for use in other files
export type Identity = account.Identity

export type ComposeMode = 'new' | 'reply' | 'reply-all' | 'forward'

/**
 * Signature marker - used to identify where signature starts for removal/swapping
 * Using three zero-width spaces as an invisible marker that TipTap preserves in text nodes
 */
export const SIGNATURE_MARKER = '\u200B\u200B\u200B'

/**
 * Build signature HTML from identity settings
 */
export function buildSignatureHtml(identity: Identity): string {
  if (!identity.signatureEnabled) return ''
  if (!identity.signatureHtml) return ''

  let html: string

  // Add separator line if enabled (with marker at the start)
  if (identity.signatureSeparator) {
    html = `<p>${SIGNATURE_MARKER}-- </p>`
  } else {
    // Inject marker into the first element of the signature
    // This ensures TipTap preserves it as text content
    html = identity.signatureHtml.replace(/^(<p[^>]*>)/, `$1${SIGNATURE_MARKER}`)
    // If signature doesn't start with <p>, wrap the marker
    if (!html.includes(SIGNATURE_MARKER)) {
      html = `<p>${SIGNATURE_MARKER}</p>` + identity.signatureHtml
    }
  }

  // If we added separator, append the rest of the signature
  if (identity.signatureSeparator) {
    html += identity.signatureHtml
  }

  return html
}

/**
 * Check if signature should be appended for the given compose mode
 */
export function shouldAppendSignature(identity: Identity, mode: ComposeMode): boolean {
  if (!identity.signatureEnabled) return false

  switch (mode) {
    case 'new':
      return identity.signatureForNew
    case 'reply':
    case 'reply-all':
      return identity.signatureForReply
    case 'forward':
      return identity.signatureForForward
    default:
      return false
  }
}

/**
 * Insert signature into editor content based on compose mode and placement settings
 */
export function insertSignatureIntoContent(
  content: string,
  signatureHtml: string,
  mode: ComposeMode,
  placement: string = 'above'
): string {
  if (placement === 'above') {
    // Look for a citation line ("On DATE, SENDER wrote:") to insert signature above it.
    // Search for "wrote:" followed by optional <br> and closing </p> tag.
    // This works regardless of compose mode or whether TipTap preserves blockquotes.
    const wroteMatch = content.match(/wrote:\s*(<br[^>]*>)?\s*<\/p>/i)
    if (wroteMatch && wroteMatch.index !== undefined) {
      const before = content.substring(0, wroteMatch.index)
      const pStart = before.lastIndexOf('<p')
      if (pStart > -1) {
        const quotedContent = content.substring(pStart)
        // typing area + blank line below content + signature + 2 blank lines before citation
        return '<p></p><p></p>' + signatureHtml + '<p></p><p></p>' + quotedContent
      }
    }

    // Check for forwarded message header
    const fwdMatch = content.match(/---------- Forwarded message ----------/)
    if (fwdMatch && fwdMatch.index !== undefined) {
      const fwdBefore = content.substring(0, fwdMatch.index)
      const fwdPStart = fwdBefore.lastIndexOf('<p')
      if (fwdPStart > -1) {
        const forwardedContent = content.substring(fwdPStart)
        return '<p></p><p></p>' + signatureHtml + '<p></p><p></p>' + forwardedContent
      }
    }

    // Fallback: try blockquote
    const blockquoteIndex = content.indexOf('<blockquote')
    if (blockquoteIndex > -1) {
      const blockquote = content.substring(blockquoteIndex)
      // typing area + blank line below content + signature + 2 blank lines before citation
      return '<p></p><p></p>' + signatureHtml + '<p></p><p></p>' + blockquote
    }
  }

  // New message or no quoted content found
  const isEmpty = content === '<p></p>' || content === '' || content === '<p><br></p>'
  if (isEmpty) {
    // typing area + blank line below content + signature
    return '<p></p><p></p>' + signatureHtml
  }
  return content + '<p></p>' + signatureHtml
}

/**
 * Remove signature from content using the marker, preserving quoted content (replies/forwards)
 */
export function removeSignatureFromContent(content: string): string {
  const markerIndex = content.indexOf(SIGNATURE_MARKER)
  if (markerIndex === -1) return content

  // Find the start of the element containing the marker (the <p> tag)
  const beforeMarker = content.substring(0, markerIndex)
  const sigElementStart = beforeMarker.lastIndexOf('<p')
  if (sigElementStart === -1) {
    // Fallback: remove marker to end
    return content.substring(0, markerIndex).replace(/(<br\s*\/?>)+\s*$/, '')
  }

  const afterMarker = content.substring(markerIndex)

  // Look for quoted content after the signature marker:
  // 1. Citation line ("wrote:" pattern)
  const wroteMatch = afterMarker.match(/<p[^>]*>(?:(?!<\/p>).)*wrote:\s*(<br[^>]*>)?\s*<\/p>/i)
  // 2. Blockquote
  const blockquoteMatch = afterMarker.match(/<blockquote/)

  // Find the earliest quoted content boundary
  let quotedStart = -1
  if (wroteMatch?.index !== undefined) {
    quotedStart = markerIndex + wroteMatch.index
  }
  if (blockquoteMatch?.index !== undefined) {
    const bqStart = markerIndex + blockquoteMatch.index
    if (quotedStart === -1 || bqStart < quotedStart) {
      quotedStart = bqStart
    }
  }

  if (quotedStart === -1) {
    // No quoted content found - remove from signature start to end
    let result = content.substring(0, sigElementStart)
    result = result.replace(/(<p>\s*<\/p>\s*)+$/, '')
    result = result.replace(/(<br\s*\/?>)+\s*$/, '')
    return result
  }

  // Preserve quoted content, remove only the signature between
  const beforeSig = content.substring(0, sigElementStart)
  const quotedContent = content.substring(quotedStart)

  return beforeSig + quotedContent
}

/**
 * Check if content already contains a signature marker
 */
export function hasSignatureMarker(content: string): boolean {
  return content.includes(SIGNATURE_MARKER)
}

// Plain-text compose mode edits a textarea instead of the rich editor, so the
// signature has to be inserted as text there.

const PLAIN_FWD_SEPARATOR = '---------- Forwarded message ----------'

/**
 * Build the plain-text signature from identity settings (signatureText, or
 * the HTML signature converted to text). Returns '' when there is none.
 */
export function buildSignatureText(identity: Identity, htmlToText: (html: string) => string): string {
  if (!identity.signatureEnabled) return ''
  const text = (identity.signatureText || htmlToText(identity.signatureHtml || '')).trim()
  if (!text) return ''
  return identity.signatureSeparator ? `-- \n${text}` : text
}

/**
 * Index where quoted content (citation line or forward header) starts in a
 * plain-text body, or -1 when there is none.
 */
function plainQuoteStart(content: string): number {
  const starts = [content.search(/^.*wrote:\s*$/m), content.indexOf(PLAIN_FWD_SEPARATOR)].filter(i => i > -1)
  return starts.length > 0 ? Math.min(...starts) : -1
}

/**
 * Whether the plain-text body already contains the signature in the part the
 * user writes (before any quoted content).
 */
export function hasSignatureText(content: string, signatureText: string): boolean {
  if (!signatureText) return false
  const quoteStart = plainQuoteStart(content)
  const userPart = quoteStart > -1 ? content.substring(0, quoteStart) : content
  return userPart.includes(signatureText)
}

/**
 * Insert the signature into a plain-text body, mirroring insertSignatureIntoContent:
 * above the quoted text by default, otherwise at the end.
 */
export function insertSignatureIntoText(content: string, signatureText: string, placement: string = 'above'): string {
  const quoteStart = plainQuoteStart(content)
  if (placement === 'above' && quoteStart > -1) {
    return '\n\n' + signatureText + '\n\n\n' + content.substring(quoteStart)
  }
  if (content.trim() === '') {
    return '\n\n' + signatureText
  }
  return content.replace(/\s+$/, '') + '\n\n' + signatureText
}

/**
 * Remove a previously inserted signature from a plain-text body (used when
 * the From identity changes).
 */
export function removeSignatureFromText(content: string, signatureText: string): string {
  if (!signatureText) return content
  const index = content.indexOf(signatureText)
  if (index === -1) return content
  const before = content.substring(0, index).replace(/\n+$/, '')
  const after = content.substring(index + signatureText.length).replace(/^\n+/, '')
  if (!after) return before
  return before + '\n\n' + after
}
