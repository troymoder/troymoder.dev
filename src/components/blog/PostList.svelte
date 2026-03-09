<script lang="ts">
    import type { Post } from "@lib/posts";

    type Props = {
        posts: Post[];
        showReadMore?: boolean;
        activeTag?: string | null;
        onTagClick?: (e: MouseEvent, tag: string) => void;
    };

    const { posts, showReadMore = true, activeTag = null, onTagClick }: Props = $props();

    function formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function handleTagClick(e: MouseEvent, tag: string) {
        if (onTagClick) {
            onTagClick(e, tag);
        }
    }
</script>

<ul class="post-list">
    {#each posts as post (post.slug)}
        <li>
            <div class="post-header">
                <a href={`/blog/${post.slug}`} class="post-title no-underline">{post.data.title}</a>
                {#if post.data.minutesRead}
                    <span class="reading-time">// {post.data.minutesRead}</span>
                {/if}
            </div>
            <div class="post-meta">
                <time datetime={post.data.date.toISOString()}>
                    {formatDate(post.data.date)}
                </time>
                {#if post.data.tags?.length}
                    <span class="separator"> · </span>
                    {#each post.data.tags as tag, i (tag)}
                        <a
                            href={`/blog?tag=${tag}`}
                            class="post-tag no-underline"
                            class:active={activeTag === tag}
                            onclick={(e) => handleTagClick(e, tag)}>{
                            tag
                        }</a>{#if i < post.data.tags.length - 1},
                        {/if}
                    {/each}
                {/if}
            </div>
            {#if post.data.description}
                <p class="post-summary">{post.data.description}</p>
            {/if}
            {#if showReadMore}
                <a href={`/blog/${post.slug}`} class="read-more no-underline">Read more ⤴</a>
            {/if}
        </li>
    {/each}
</ul>

<style>
    .post-list {
      list-style: none;
      padding: 0;
      padding-inline-start: 0;
    }
    .post-list li {
      text-indent: 0;
      margin-block-end: 1.5em;

      &::before {
        content: none;
      }
    }
    .post-list li > * {
      text-indent: 0;
    }
    .post-header {
      display: flex;
      align-items: baseline;
      gap: 0.5em;
      margin-inline-start: -0.2em;
    }
    .post-title {
      font-size: 1.1rem;
      font-weight: bold;
    }
    .reading-time {
      color: var(--color-text-muted);
      font-size: 0.75em;
      font-family: monospace;
    }
    .post-meta {
      color: var(--color-text-meta);
      font-size: 0.9em;
      margin-block: 0.25em;
      margin-inline-start: 1em;
    }
    .post-tag {
      font-size: 0.95rem;

      &.active {
        background-color: var(--color-primary-hover);
        color: white;
      }
    }
    .post-summary {
      color: var(--color-text-muted);
      margin-inline-start: 1em;
    }
    .read-more {
      font-size: 0.9em;
      display: inline-block;
      margin-inline-start: 1em;
    }
</style>
