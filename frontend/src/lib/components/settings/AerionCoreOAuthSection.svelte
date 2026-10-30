<script lang="ts">
  // AerionCoreOAuthSection — Settings → Accounts disclosure section for
  // Aerion CORE's OAuth client credentials (google-mail, microsoft-mail).
  //
  // COLLAPSED by default. Mailaxe (unofficial Aerion fork) ships without
  // OAuth creds, so this is where users enter their own Google/Microsoft
  // client to add OAuth accounts.
  //
  // Per-extension OAuth slots (google-contacts, microsoft-contacts, etc.)
  // live inside that extension's own settings dialog, NOT here.
  //
  // Visual disclosure pattern lifted from sidebar/AccountSection.svelte
  // (isExpanded state + chevron icon toggle) — no separate collapsible
  // component exists in the kit.

  import Icon from '@iconify/svelte'
  import OAuthCredsSlotEditor from '$lib/components/kit/OAuthCredsSlotEditor.svelte'

  let isExpanded = $state(false)
</script>

<section class="mt-6 border-t border-border pt-4">
  <button
    type="button"
    class="flex items-center gap-2 w-full text-left hover:text-foreground transition-colors"
    onclick={() => { isExpanded = !isExpanded }}
    aria-expanded={isExpanded}
  >
    <Icon
      icon={isExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
      class="w-4 h-4 text-muted-foreground"
    />
    <span class="font-medium text-foreground">OAuth Credentials</span>
    <span class="text-xs text-muted-foreground">(advanced)</span>
  </button>

  {#if isExpanded}
    <div class="mt-3 space-y-3">
      <p class="text-sm text-muted-foreground">
        Mailaxe is distributed without OAuth credentials. Enter your own OAuth
        Client ID (and Secret for Google) here to add Google and Microsoft email
        accounts, or add them with IMAP and an app password instead.
      </p>
      <OAuthCredsSlotEditor
        configID="google-mail"
        label="Google Mail"
        secretRequired={true}
      />
      <OAuthCredsSlotEditor
        configID="microsoft-mail"
        label="Microsoft Mail"
        secretRequired={false}
      />
    </div>
  {/if}
</section>
