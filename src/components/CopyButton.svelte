<script lang="ts">
    import Check from "@icons/Check.svelte";
    import Copy from "@icons/Copy.svelte";

    type Props = {
        getCode: () => string;
    };

    const { getCode }: Props = $props();

    let copied = $state(false);

    async function handleClick() {
        await navigator.clipboard.writeText(getCode());
        copied = true;
        setTimeout(() => {
            copied = false;
        }, 2000);
    }
</script>

<button class="copy-button" class:copied onclick={handleClick}>
    {#if copied}
        <Check />
    {:else}
        <Copy />
    {/if}
</button>

<style>
    .copy-button {
      padding: 0.35em;
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      z-index: 1;
      font: inherit;

      &.copied {
        opacity: 1;
        background-color: var(--color-primary);
        color: white;
      }

      &:hover {
        opacity: 1;
        background-color: var(--color-primary);
        color: white;
      }
    }

    :global(.code-block):hover .copy-button {
      opacity: 1;
    }
</style>
