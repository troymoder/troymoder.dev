<script lang="ts">
    import { onMount } from "svelte";

    type TocItem = {
        id: string;
        text: string;
        depth?: number;
    };

    type Props = {
        items: TocItem[];
        smooth?: boolean;
    };

    const { items, smooth = true }: Props = $props();

    let mobileOpen = $state(false);
    let activeSlugs = $state<Set<string>>(new Set());
    let tocList = $state<HTMLElement | null>(null);

    function handleClick(e: MouseEvent, id: string, index: number) {
        if (!smooth) return;
        e.preventDefault();
        const wasOpen = mobileOpen;
        mobileOpen = false;

        if (index === 0 && !wasOpen) {
            const el = document.getElementById(id);
            if (el) {
                const elBottom = el.getBoundingClientRect().bottom + window.scrollY;
                if (elBottom <= window.innerHeight) {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    history.pushState(null, "", window.location.pathname);
                    return;
                }
            }
        }

        history.pushState(null, "", `#${id}`);

        const scrollToElement = () => {
            const el = document.getElementById(id);
            if (el) {
                const offset = 20;
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
            }
        };

        if (wasOpen) {
            requestAnimationFrame(() => requestAnimationFrame(scrollToElement));
        } else {
            scrollToElement();
        }
    }

    function toggleMobile() {
        mobileOpen = !mobileOpen;
    }

    function updateIndicator(slugs: Set<string>) {
        if (!tocList || slugs.size === 0) return;

        const indicator = tocList.querySelector(".toc-indicator") as HTMLElement | null;
        if (!indicator) return;

        let minTop = Infinity;
        let maxBottom = 0;

        for (const slug of slugs) {
            const link = tocList.querySelector(`a[href="#${slug}"]`);
            if (link) {
                const li = link.closest("li") as HTMLElement | null;
                if (li) {
                    const top = li.offsetTop;
                    const bottom = top + li.offsetHeight;
                    minTop = Math.min(minTop, top);
                    maxBottom = Math.max(maxBottom, bottom);
                }
            }
        }

        if (minTop !== Infinity) {
            indicator.style.top = `${minTop}px`;
            indicator.style.height = `${maxBottom - minTop}px`;
        }
    }

    function getVisibleItems(): Set<string> {
        const visible = new Set<string>();
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const activationLine = viewportHeight * 0.2;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;
            const el = document.getElementById(item.id);
            if (!el) continue;

            const rect = el.getBoundingClientRect();
            const headingTop = rect.top;

            const nextItem = items[i + 1];
            const nextEl = nextItem ? document.getElementById(nextItem.id) : null;
            const sectionBottom = nextEl
                ? nextEl.getBoundingClientRect().top
                : document.documentElement.scrollHeight - scrollY;

            const headingVisible = headingTop >= 0 && headingTop < viewportHeight;
            const sectionActive = headingTop < activationLine
                && sectionBottom > activationLine;

            if (headingVisible || sectionActive) {
                visible.add(item.id);
            }
        }

        if (visible.size === 0 && items[0]) {
            visible.add(items[0].id);
        }

        return visible;
    }

    function onScroll() {
        const visible = getVisibleItems();
        activeSlugs = visible;
        updateIndicator(visible);
    }

    onMount(() => {
        if (items.length === 0) return;

        window.addEventListener("scroll", onScroll, { passive: true });

        setTimeout(() => {
            const visible = getVisibleItems();
            activeSlugs = visible;
            updateIndicator(visible);
        }, 50);

        return () => window.removeEventListener("scroll", onScroll);
    });
</script>

{#if items.length > 0}
    <!-- Mobile TOC -->
    <div class="toc-mobile">
        <button
            class="toc-toggle"
            onclick={toggleMobile}
            aria-expanded={mobileOpen}
            aria-controls="toc-mobile-nav">
            <span>Contents</span>
            <svg
                class="toc-chevron"
                class:open={mobileOpen}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true">
                <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
        {#if mobileOpen}
            <nav id="toc-mobile-nav" class="toc-mobile-nav">
                <ul>
                    {#each items as item, i}
                        <li style:padding-inline-start="{((item.depth ?? 2) - 2) * 0.75}rem">
                            <a
                                href={`#${item.id}`}
                                class="no-underline"
                                onclick={(e) => handleClick(e, item.id, i)}>
                                {item.text}
                            </a>
                        </li>
                    {/each}
                </ul>
            </nav>
        {/if}
    </div>

    <!-- Desktop TOC -->
    <aside class="toc-sidebar">
        <nav class="toc">
            <ul bind:this={tocList}>
                <div class="toc-indicator"></div>
                {#each items as item, i}
                    <li
                        class:active={activeSlugs.has(item.id)}
                        style:padding-inline-start="{((item.depth ?? 2) - 2) * 0.75}rem">
                        <a
                            href={`#${item.id}`}
                            class="no-underline"
                            onclick={(e) => handleClick(e, item.id, i)}>{item.text}</a>
                    </li>
                {/each}
            </ul>
        </nav>
    </aside>
{/if}

<style>
    .toc-mobile {
      display: block;
      margin-block: 1.5rem;
      border: 1px solid var(--color-border, #e5e5e5);
      border-radius: 0.5rem;
      overflow: hidden;

      @media (min-width: 1300px) and (min-height: 600px) {
        display: none;
      }
    }

    .toc-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--color-surface, #fafafa);
      border: none;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text);
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &:hover, &:focus-visible {
        background: var(--color-surface-hover, #f0f0f0);
      }

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
      }
    }

    .toc-chevron {
      transition: transform 0.2s ease;

      &.open {
        transform: rotate(180deg);
      }
    }

    .toc-mobile-nav {
      border-top: 1px solid var(--color-border, #e5e5e5);
      padding: 0.75rem 1rem;
      background: var(--color-bg);

      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        text-indent: 0;
        margin-block: 0;

        &::before {
          content: none;
        }

        a {
          display: block;
          padding: 0.4rem 0;
          color: var(--color-text-muted);
          font-size: 0.875rem;
          line-height: 1.4;
          background: transparent;

          &:hover, &:focus-visible {
            color: var(--color-text);
            background: transparent;
          }
        }
      }
    }

    .toc-sidebar {
      display: none;

      @media (min-width: 1300px) and (min-height: 600px) {
        display: block;
        position: sticky;
        top: 1rem;
        float: right;
        width: 220px;
        margin-right: calc(-220px - 2rem);
        max-height: calc(100vh - 2rem);
        overflow-y: auto;
        scrollbar-width: thin;
      }
    }

    .toc {
      font-size: 0.8rem;

      ul {
        margin: 0;
        padding: 0 0 0 0.75rem;
        list-style: none;
        position: relative;
        overflow: hidden;
      }

      li {
        text-indent: 0;
        margin-block: 0;
        position: relative;
        transition: color 0.2s ease;

        &::before {
          content: none;
        }

        a {
          display: block;
          padding: 0.3rem 0;
          color: var(--color-text-muted);
          transition: color 0.2s ease;
          line-height: 1.3;
          background: transparent;

          &:hover, &:focus-visible {
            color: var(--color-text);
            background: transparent;
            outline: none;
            font-weight: 800 !important;
          }
        }

        &.active a {
          color: var(--color-text);
          font-weight: 500;
        }
      }
    }

    .toc-indicator {
      position: absolute;
      left: 0;
      width: 2px;
      background-color: var(--color-primary);
      border-radius: 1px;
      transition: top 0.25s ease, height 0.25s ease;
      pointer-events: none;
    }
</style>
