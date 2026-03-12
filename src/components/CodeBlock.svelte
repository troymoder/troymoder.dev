<script lang="ts">
    import CopyButton from "@components/CopyButton.svelte";
    import { type Snippet } from "svelte";
    import { onMount } from "svelte";
    import { SvelteMap, SvelteSet } from "svelte/reactivity";

    type Props = {
        children: Snippet;
        showLines?: boolean;
        showFold?: boolean;
    };

    const { children, showLines = true, showFold = true }: Props = $props();

    let thisElement: HTMLElement;
    let code: string;
    const lineElements = $state<HTMLElement[]>([]);
    const codeRegions = new SvelteMap<number, number>();
    const collapsedRegions = new SvelteSet<number>();

    function getIndent(text: string): number {
        const match = text.match(/^(\s*)/);
        return match?.[1]?.length ?? 0;
    }

    function parseLines(lines: HTMLElement[]) {
        codeRegions.clear();
        const n = lines.length;
        const indents: number[] = [];

        for (let i = 0; i < n; i++) {
            const line = lines[i]!;
            const isEmpty = line.textContent?.trim() === "";
            indents.push(isEmpty ? -1 : getIndent(line.textContent));
        }

        const stack: { index: number; indent: number }[] = [];

        for (let i = 0; i <= n; i++) {
            const indent = i < n ? indents[i]! : -Infinity;
            if (indent === -1) continue;

            while (stack.length > 0 && indent <= stack[stack.length - 1]!.indent) {
                const { index } = stack.pop()!;
                if (i - 1 > index) {
                    codeRegions.set(index, i - 1);
                }
            }

            if (i < n) {
                stack.push({ index: i, indent });
            }
        }

        const nextNonEmptyIndent: number[] = new Array(n).fill(-Infinity);
        let lastSeen = -Infinity;
        for (let i = n - 1; i >= 0; i--) {
            nextNonEmptyIndent[i] = lastSeen;
            if (indents[i]! !== -1) {
                lastSeen = indents[i]!;
            }
        }

        for (const [start] of codeRegions) {
            if (indents[start] !== -1 && nextNonEmptyIndent[start]! <= indents[start]!) {
                codeRegions.delete(start);
            }
        }
    }

    function toggleRegion(index: number) {
        if (collapsedRegions.has(index)) {
            collapsedRegions.delete(index);
        } else {
            collapsedRegions.add(index);
        }
    }

    function expandRegion(index: number) {
        collapsedRegions.delete(index);
    }

    function isLineHidden(lineIndex: number): boolean {
        for (const [start, end] of codeRegions) {
            if (collapsedRegions.has(start) && lineIndex > start && lineIndex <= end) {
                return true;
            }
        }
        return false;
    }

    $effect(() => {
        for (let i = 0; i < lineElements.length; i++) {
            const line = lineElements[i];
            if (!line) continue;

            const isCollapsed = collapsedRegions.has(i);
            const isHidden = isLineHidden(i);

            line.classList.toggle("collapsed", isCollapsed);
            line.classList.toggle("hidden", isHidden);
        }
    });

    onMount(() => {
        const codeElement = thisElement.querySelector("code");
        if (!codeElement) return;
        code = codeElement.textContent?.trim() || "";
        code += "\n";

        lineElements.push(...codeElement.querySelectorAll<HTMLElement>(".line"));

        lineElements.forEach((el, index) => {
            el.setAttribute("data-line", (index + 1).toString());
        });

        if (showFold) {
            parseLines(lineElements);

            for (const [index] of codeRegions) {
                const line = lineElements[index]!;
                line.classList.add("foldable");

                const ellipsis = document.createElement("button");
                ellipsis.className = "fold-ellipsis";
                ellipsis.textContent = "...";
                ellipsis.addEventListener("click", () => expandRegion(index));

                line.appendChild(ellipsis);
            }
        }
    });
</script>

<div
    class="code-block"
    class:no-lines={!showLines}
    class:fold-only={!showLines && showFold}
    bind:this={thisElement}>
    <div class="copy-button-container">
        <CopyButton getCode={() => code} />
    </div>
    {#if showLines || showFold}
        <div class="gutter" class:line-numbers={showLines} class:fold-gutter={!showLines}>
            {#each lineElements as _, index (index)}
                {#if !isLineHidden(index)}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class:line-number={showLines}
                        class:fold-row={!showLines}
                        class:foldable={showFold && codeRegions.has(index)}
                        class:collapsed={collapsedRegions.has(index)}
                        onclick={() => showFold && toggleRegion(index)}
                        aria-label="Toggle fold">
                        {#if showLines}
                            <span class="number">{index + 1}</span>
                        {/if}
                        {#if showFold && codeRegions.has(index)}
                            <span class="fold-chevron"></span>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
    {@render children()}
</div>

<style>
    .code-block {
      position: relative;

      :global(.fold-ellipsis) {
        display: none;
        color: var(--color-text-muted);
        font-style: italic;
        cursor: pointer;
        user-select: none;
        border: none;
        background: none;
        font-weight: bold;

        &:hover {
          color: var(--color-text);
        }
      }

      :global(.line.collapsed .fold-ellipsis) {
        display: inline;
      }
    }

    .gutter {
      display: flex;
      flex-direction: column;
      color: var(--color-text-muted);
      user-select: none;
      position: absolute;
      top: 1px;
      bottom: 1px;
      line-height: 1.4;
      margin: 1em 0;
      z-index: 100;

      &:hover .fold-chevron {
        opacity: 1 !important;
      }

      .fold-chevron {
        flex-shrink: 0;
        width: 1em;
        height: 1em;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease, color 0.15s ease;
        background: none;
        border: none;
        padding: 0;
        color: inherit;

        &::before {
          content: "";
          width: 0;
          height: 0;
          border-left: 5px solid currentColor;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          transition: transform 0.15s ease;
          transform: rotate(90deg);
        }
      }

      .collapsed .fold-chevron {
        opacity: 1 !important;
        &::before {
          transform: rotate(0deg);
        }
      }
    }

    .line-numbers {
      left: calc(-3.5em + 1px);
      width: 3em;

      .line-number {
        transition: opacity 0.15s ease, color 0.15s ease;
        display: flex;
        align-items: center;
        height: 1lh;
        color: var(--color-text-muted);

        .number {
          width: 100%;
          text-align: right;
        }

        &:hover {
          color: var(--color-text);
          font-weight: bold;
        }

        &::after {
          content: "";
          width: 1em;
          flex-shrink: 0;
        }

        .fold-chevron {
          margin-right: -1em;
        }
      }
    }

    .fold-gutter {
      left: calc(-1.25em - 0.5em + 1px);
      width: 1.25em;
      background-color: transparent;

      .fold-row {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1lh;

        &.foldable {
          cursor: pointer;
        }
      }
    }

    .copy-button-container {
      position: absolute;
      top: 0.5em;
      right: 1em;
      font-size: 1.5rem;
      z-index: 1;
    }
</style>
