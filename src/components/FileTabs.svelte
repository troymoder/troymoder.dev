<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        files: string[];
        activeIndex?: number;
        children: Snippet;
    };

    const { files, activeIndex = 0, children }: Props = $props();

    let fileTabs: HTMLDivElement;

    function handleClick(e: MouseEvent) {
        const btn = e.target as HTMLButtonElement;
        const index = parseInt(btn.dataset.tabIndex ?? "0", 10);
        fileTabs.dataset.activeTab = index.toString();
    }
</script>

<div class="file-tabs" data-active-tab={activeIndex} bind:this={fileTabs}>
    <div class="tabs-bar">
        {#each files as file, i (i)}
            <button class="tab" data-tab-index={i} type="button" onclick={handleClick}>
                {file}
            </button>
        {/each}
    </div>
    <div class="tabs-content">
        {@render children()}
    </div>
</div>

<style>
    .file-tabs {
      margin-block: 1.5rem;

      :global(.expressive-code) {
        display: none;
      }
    }

    .tabs-bar {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--color-border, #e5e5e5);
      margin-bottom: -1px;
      position: relative;
      z-index: 1;
    }

    .tab {
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid transparent;
      border-bottom: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-family: inherit;
      color: var(--color-text-muted, #6b6b6b);
      transition: color 0.15s ease, background 0.15s ease;
      border-radius: 6px 6px 0 0;
      margin-bottom: -1px;

      &:hover {
        color: var(--color-text, #232333);
        background: var(--color-background-code, #fef9f3);
      }
    }

    .file-tabs[data-active-tab="0"] .tab[data-tab-index="0"],
    .file-tabs[data-active-tab="1"] .tab[data-tab-index="1"],
    .file-tabs[data-active-tab="2"] .tab[data-tab-index="2"],
    .file-tabs[data-active-tab="3"] .tab[data-tab-index="3"],
    .file-tabs[data-active-tab="4"] .tab[data-tab-index="4"],
    .file-tabs[data-active-tab="5"] .tab[data-tab-index="5"],
    .file-tabs[data-active-tab="6"] .tab[data-tab-index="6"],
    .file-tabs[data-active-tab="7"] .tab[data-tab-index="7"] {
      color: var(--color-text, #232333);
      background: var(--color-background-code, #fef9f3);
      border-color: var(--color-border, #e5e5e5);
      border-bottom: 1px solid var(--color-background-code, #fef9f3);
    }

    .tabs-content {
      :global(.expressive-code) {
        margin-top: 0;
      }

      :global(pre) {
        margin-top: 0;
        border-top-left-radius: 0;
      }
    }

    .file-tabs[data-active-tab="0"] .tabs-content :global(.expressive-code:nth-child(1)),
    .file-tabs[data-active-tab="1"] .tabs-content :global(.expressive-code:nth-child(2)),
    .file-tabs[data-active-tab="2"] .tabs-content :global(.expressive-code:nth-child(3)),
    .file-tabs[data-active-tab="3"] .tabs-content :global(.expressive-code:nth-child(4)),
    .file-tabs[data-active-tab="4"] .tabs-content :global(.expressive-code:nth-child(5)),
    .file-tabs[data-active-tab="5"] .tabs-content :global(.expressive-code:nth-child(6)),
    .file-tabs[data-active-tab="6"] .tabs-content :global(.expressive-code:nth-child(7)),
    .file-tabs[data-active-tab="7"] .tabs-content :global(.expressive-code:nth-child(8)) {
      display: block;
    }
</style>
