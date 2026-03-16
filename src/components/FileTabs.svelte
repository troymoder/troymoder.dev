<script lang="ts">
    import { onMount } from "svelte";
    import type { Snippet } from "svelte";

    type Props = {
        files: string[];
        activeIndex?: number;
        collapsed?: boolean;
        children: Snippet;
    };

    const {
        files,
        activeIndex: initialActiveIndex = 0,
        collapsed: initialCollapsed = false,
        children,
    }: Props = $props();

    let fileTabs: HTMLDivElement;

    let activeCollapsed = $state<boolean | null>(null);
    const isCollapsed = $derived(activeCollapsed ?? initialCollapsed);
    let activeIndex = $state<number | null>(null);
    const currentIndex = $derived(activeIndex ?? initialActiveIndex);

    function handleTabClick(e: MouseEvent, index: number) {
        if (isCollapsed) {
            toggleCollapse();
        }
        activeIndex = index;
        (e.target as HTMLElement)?.blur();
    }

    function toggleCollapse() {
        activeCollapsed = !isCollapsed;
    }

    onMount(() => {
        const diffBlocks = fileTabs.querySelectorAll<HTMLElement>(".diff-block");

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName !== "data-diff-mode") continue;
                const target = mutation.target as HTMLElement;
                const mode = target.dataset.diffMode;
                if (!mode) continue;

                for (const block of diffBlocks) {
                    if (block !== target && block.dataset.diffMode !== mode) {
                        block.dataset.diffMode = mode;
                    }
                }
            }
        });

        for (const block of diffBlocks) {
            observer.observe(block, {
                attributeFilter: ["data-diff-mode"],
            });
        }

        return () => observer.disconnect();
    });
</script>

<div
    class="file-tabs"
    data-active-tab={currentIndex}
    class:collapsed={isCollapsed}
    bind:this={fileTabs}>
    <div class="tabs-bar">
        <button
            class="collapse-toggle"
            type="button"
            onclick={toggleCollapse}
            aria-label={isCollapsed ? "Expand code" : "Collapse code"}>
            <svg class="collapse-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                    d="M4.5 3L7.5 6L4.5 9"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
        <div class="tabs-dropdown-wrapper">
            <button class="dropdown-trigger" type="button" aria-haspopup="listbox">
                <span>{files[currentIndex]}</span>
                <svg class="chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
            <div class="tabs-list">
                {#each files as file, i (i)}
                    <button
                        class="tab"
                        class:active={currentIndex === i}
                        data-tab-index={i}
                        type="button"
                        onclick={(e) => handleTabClick(e, i)}>
                        {file}
                    </button>
                {/each}
            </div>
        </div>
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

    .file-tabs.collapsed .tabs-content {
      display: none;
    }

    .file-tabs.collapsed .tabs-bar {
      margin-bottom: 0;
    }

    .file-tabs.collapsed .tab.active {
      border-radius: 6px;
      border-bottom: 1px solid var(--color-border, #e5e5e5);
    }

    .tabs-bar {
      position: relative;
      margin-bottom: -1px;
      z-index: 2;
      display: flex;
      align-items: center;
    }

    .collapse-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      margin-right: 0.25rem;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: var(--color-text-muted, #6b6b6b);
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease;

      &:hover {
        color: var(--color-text, #232333);
        background: var(--color-background-code, #fef9f3);
      }
    }

    .collapse-chevron {
      transition: transform 0.15s ease;
    }

    .file-tabs:not(.collapsed) .collapse-chevron {
      transform: rotate(90deg);
    }

    .tabs-dropdown-wrapper {
      display: contents;

      @media (max-width: 640px) {
        display: block;
        position: relative;
        flex: 1;
      }
    }

    .dropdown-trigger {
      display: none;

      @media (max-width: 640px) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.5rem 0.75rem;
        font-size: 0.85rem;
        font-family: inherit;
        color: var(--color-text, #232333);
        background: var(--color-background-code, #fef9f3);
        border: 1px solid var(--color-border, #e5e5e5);
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        cursor: pointer;

        .file-tabs.collapsed & {
          border-radius: 6px;
          border-bottom: 1px solid var(--color-border, #e5e5e5);
        }
      }
    }

    .chevron {
      transition: transform 0.15s ease;
    }

    .tabs-dropdown-wrapper:focus-within .chevron {
      transform: rotate(180deg);
    }

    .tabs-list {
      display: flex;
      gap: 0;

      @media (max-width: 640px) {
        display: none;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--color-background, #fff);
        border: 1px solid var(--color-border, #e5e5e5);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 0.25rem 0;

        .tabs-dropdown-wrapper:focus-within & {
          display: flex;
        }
      }
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

      &.active {
        color: var(--color-text, #232333);
        background: var(--color-background-code, #fef9f3);
        border-color: var(--color-border, #e5e5e5);
        border-bottom: 1px solid var(--color-background-code, #fef9f3);
      }

      @media (max-width: 640px) {
        border: none;
        border-radius: 0;
        margin-bottom: 0;
        text-align: left;
        padding: 0.5rem 0.75rem;

        &.active {
          font-weight: 500;
          border: none;
          background: transparent;
        }

        &:hover {
          background: var(--color-background-code, #fef9f3);
        }
      }
    }

    .tabs-content {
      :global(.expressive-code) {
        margin-top: 0;
      }

      :global(pre) {
        margin-top: 0;
        border-top-left-radius: 0;
      }

      @media (max-width: 640px) {
        :global(pre) {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }
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
