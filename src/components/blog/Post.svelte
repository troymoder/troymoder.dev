<script lang="ts">
    import CodeBlock from "@components/CodeBlock.svelte";
    import Heading from "@components/Heading.svelte";
    import TableOfContents from "@components/TableOfContents.svelte";
    import type { MarkdownHeading } from "astro";
    import type { CollectionEntry } from "astro:content";
    import type { Snippet } from "svelte";
    import { createRawSnippet, mount, onMount } from "svelte";

    type Props = {
        post: CollectionEntry<"blog">;
        headings?: MarkdownHeading[];
        minutesRead?: string;
        children: Snippet;
    };

    const { post, headings = [], minutesRead, children }: Props = $props();

    const slug = $derived(
        post.data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
    );

    const tocItems = $derived(
        headings.map((h) => ({ id: h.slug, text: h.text, depth: h.depth })),
    );

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    const levelMap: Record<string, 1 | 2 | 3 | 4> = { H1: 1, H2: 2, H3: 3, H4: 4 };

    function hydrateHeadingAnchors() {
        document.querySelectorAll(
            "h1[data-heading-anchor], h2[data-heading-anchor], h3[data-heading-anchor], h4[data-heading-anchor]",
        ).forEach((heading) => {
            const text = heading.textContent?.trim();
            if (!text) return;
            const slug = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
            const level = levelMap[heading.tagName];
            if (!level) return;

            const span = document.createElement("span");
            span.innerHTML = heading.innerHTML;

            const children = createRawSnippet(() => ({
                render: () => span.outerHTML,
            }));

            const wrapper = document.createElement("div");
            mount(Heading, {
                target: wrapper,
                props: {
                    level,
                    id: slug,
                    children,
                },
            });
            heading.replaceWith(...wrapper.childNodes);
        });
    }

    function hydrateCodeBlocks() {
        document.querySelectorAll("pre[data-code-block]").forEach((block) => {
            const outerHTML = block.outerHTML;
            const children = createRawSnippet(() => ({
                render: () => outerHTML,
            }));

            const wrapper = document.createElement("div");

            const showLines = !block.hasAttribute("data-no-lines");
            const showFold = !block.hasAttribute("data-no-fold");

            mount(CodeBlock, {
                target: wrapper,
                props: { children, showLines, showFold },
            });

            block.replaceWith(...wrapper.childNodes);
        });
    }

    onMount(() => {
        hydrateCodeBlocks();
        hydrateHeadingAnchors();
    });
</script>

<div class="post-layout">
    <TableOfContents items={tocItems} />
    <article data-pagefind-body>
        <Heading level={1} id={slug}>
            {post.data.title}
            {#if minutesRead}
                <span class="read-time">// {minutesRead}</span>
            {/if}
        </Heading>
        <div class="meta">
            Posted on <time datetime={post.data.date.toISOString()}>{
                formatDate(post.data.date)
            }</time>
            <span class="meta-sep">&middot;</span>
        </div>

        {@render children()}

        {#if post.data.tags?.length}
            <hr />
            <ul class="tags">
                {#each post.data.tags as tag (tag)}
                    <li><a href={`/blog?tag=${tag}`}>{tag}</a></li>
                {/each}
            </ul>
        {/if}
    </article>
</div>

<style>
    .post-layout {
      position: relative;
    }

    .read-time {
      color: var(--color-text-muted);
      font-weight: 400;
      font-size: 0.75em;
      margin-inline-start: 1ch;
    }

    .meta {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5em;
      color: var(--color-text-meta);
      font-size: 0.9em;
      margin-block-end: 1.5em;
    }
    .meta-sep {
      color: var(--color-text-muted);
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      list-style: none;
      padding: 0;
    }

    .tags li {
      text-indent: 0;
    }

    .tags li::before {
      content: none;
    }
</style>
