<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        level?: 1 | 2 | 3 | 4;
        id?: string;
        children: Snippet;
    };

    const { level = 2, id, children }: Props = $props();
    const slug = $derived(id ?? "");
</script>

{#if level === 1}
    <h1 {id}>
        <a
            href={`#${slug}`}
            class="heading-anchor no-underline"
            aria-label={`Anchor for ${slug}`}></a>{@render children()}
    </h1>
{:else if level === 2}
    <h2 {id}>
        <a
            href={`#${slug}`}
            class="heading-anchor no-underline"
            aria-label={`Anchor for ${slug}`}></a>{@render children()}
    </h2>
{:else if level === 3}
    <h3 {id}>
        <a
            href={`#${slug}`}
            class="heading-anchor no-underline"
            aria-label={`Anchor for ${slug}`}></a>{@render children()}
    </h3>
{:else}
    <h4 {id}>
        <a
            href={`#${slug}`}
            class="heading-anchor no-underline"
            aria-label={`Anchor for ${slug}`}></a>{@render children()}
    </h4>
{/if}

<style>
    :global(h1), :global(h2), :global(h3), :global(h4) {
      position: relative;
      font-size: 1.2rem;
      margin-block-start: 1em;
      margin-block-end: 0.5em;
      line-height: 1.2;
    }

    :global(h1) > .heading-anchor::before,
    :global(h1):not(:has(.heading-anchor))::before {
      content: "#";
    }

    :global(h2) > .heading-anchor::before,
    :global(h2):not(:has(.heading-anchor))::before {
      content: "##";
    }

    :global(h3) > .heading-anchor::before,
    :global(h3):not(:has(.heading-anchor))::before {
      content: "###";
    }

    :global(h4) > .heading-anchor::before,
    :global(h4):not(:has(.heading-anchor))::before {
      content: "####";
    }

    .heading-anchor {
      color: var(--color-primary);
      margin: -0.05em -0.2em;
      &:hover {
        color: white;
      }
    }

    .heading-anchor,
    :global(h1):not(:has(.heading-anchor))::before,
    :global(h2):not(:has(.heading-anchor))::before,
    :global(h3):not(:has(.heading-anchor))::before,
    :global(h4):not(:has(.heading-anchor))::before {
      position: absolute;
      right: calc(100% + 0.5em);
      color: var(--color-primary);
    }
</style>
