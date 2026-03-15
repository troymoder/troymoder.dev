<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        files: string[];
        activeIndex?: number;
        children: Snippet;
    };

    const { files, activeIndex = 0, children }: Props = $props();

    let fileTabs: HTMLDivElement;
    let activeTab = $state(activeIndex);
    let dropdownOpen = $state(false);

    function selectTab(index: number) {
        activeTab = index;
        dropdownOpen = false;
    }

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!dropdownOpen) return;
        if (e.key === "Escape") {
            dropdownOpen = false;
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            activeTab = (activeTab + 1) % files.length;
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            activeTab = (activeTab - 1 + files.length) % files.length;
        } else if (e.key === "Enter") {
            dropdownOpen = false;
        }
    }

    function handleClickOutside(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest(".tabs-bar")) {
            dropdownOpen = false;
        }
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="file-tabs" data-active-tab={activeTab} bind:this={fileTabs}>
    <div class="tabs-bar" class:dropdown-open={dropdownOpen}>
        <button
            class="dropdown-trigger"
            type="button"
            onclick={toggleDropdown}
            onkeydown={handleKeydown}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox">
            <span>{files[activeTab]}</span>
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
                    class:active={activeTab === i}
                    data-tab-index={i}
                    type="button"
                    onclick={() => selectTab(i)}>
                    {file}
                </button>
            {/each}
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

    .tabs-bar {
      position: relative;
      border-bottom: 1px solid var(--color-border, #e5e5e5);
      margin-bottom: -1px;
      z-index: 1;
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
      }
    }

    .chevron {
      transition: transform 0.15s ease;
    }

    .dropdown-open .chevron {
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
        z-index: 10;

        .dropdown-open & {
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
