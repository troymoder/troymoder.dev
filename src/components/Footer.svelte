<script lang="ts">
    import GitHubIcon from "@icons/GitHub.svelte";
    import MailIcon from "@icons/Mail.svelte";
    import RSSIcon from "@icons/RSS.svelte";
    import TwitterIcon from "@icons/Twitter.svelte";
    import type { Component } from "svelte";

    type Social = {
        name: string;
        icon: Component;
        url: string;
    };

    const socials: Social[] = [
        { name: "GitHub", icon: GitHubIcon, url: "https://github.com/troykomodo" },
        { name: "Twitter", icon: TwitterIcon, url: "https://twitter.com/troykomodo" },
        { name: "Email", icon: MailIcon, url: "mailto:me@troymoder.dev" },
        { name: "RSS", icon: RSSIcon, url: "/rss.xml" },
    ];

    const year = new Date().getFullYear();
</script>

<footer>
    <div class="footer-socials">
        {#each socials as link (link.name)}
            <a href={link.url} class="soc" aria-label={link.name} target="_blank" rel="me">
                <link.icon />
            </a>
        {/each}
    </div>
    <span class="footer-copy"><span class="copy-symbol">&copy;</span> {year} Troy Benson</span>
</footer>

<style>
    footer {
      display: flex;
      align-items: center;
      border-block-start: 0.4rem dotted var(--color-border);
      padding-block: 2rem;
      margin-block-start: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .footer-socials {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .footer-copy {
      display: flex;
      align-items: center;
      gap: 0.25em;
      color: var(--color-text-muted);
    }
    .copy-symbol {
      position: relative;
      top: 1px;
    }
    .soc {
      display: flex;
      align-items: center;
      border-block-end: none;
      padding: 0.5rem;
      border-radius: var(--border-radius);
    }
    .soc:hover, .soc:focus-visible {
      color: #ffffff;
      background-color: var(--color-primary-hover);
    }
    .soc :global(svg) {
      width: 1rem;
      height: 1rem;
    }
</style>
