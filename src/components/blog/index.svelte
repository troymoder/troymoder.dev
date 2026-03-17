<script lang="ts">
    import PostList from "@components/blog/PostList.svelte";
    import Heading from "@components/Heading.svelte";
    import RSSIcon from "@icons/RSS.svelte";
    import type { Post } from "@lib/posts";
    import { onMount } from "svelte";

    type PagefindResult = {
        id: string;
        data: () => Promise<{
            url: string;
            excerpt: string;
            meta: { title?: string; image?: string };
        }>;
    };

    type Pagefind = {
        init: () => Promise<void>;
        search: (query: string) => Promise<{ results: PagefindResult[] }>;
        debouncedSearch: (
            query: string,
            options?: object,
            timeout?: number,
        ) => Promise<{ results: PagefindResult[] } | null>;
    };

    type Props = {
        posts: Post[];
    };

    const { posts: allPosts }: Props = $props();

    const posts = $derived(
        allPosts.slice().sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()),
    );
    const tags = $derived(
        allPosts.reduce((acc, post) => {
            post.data.tags?.forEach(tag => {
                acc.set(tag, (acc.get(tag) || 0) + 1);
            });
            return acc;
        }, new Map<string, number>()),
    );

    let searchQuery = $state("");
    let activeTag = $state<string | null>(null);
    let pagefind = $state<Pagefind | null>(null);
    let searchResultUrls = $state<Set<string> | null>(null);
    let isSearching = $state(false);

    function getTagFromUrl(): string | null {
        if (typeof window === "undefined") return null;
        return new URLSearchParams(window.location.search).get("tag");
    }

    function setTag(tag: string | null) {
        activeTag = tag;
        if (typeof window === "undefined") return;
        const url = new URL(window.location.href);
        if (tag) {
            url.searchParams.set("tag", tag);
        } else {
            url.searchParams.delete("tag");
        }
        window.history.pushState({}, "", url.toString());
    }

    function handleTagClick(e: MouseEvent, tag: string) {
        e.preventDefault();
        setTag(activeTag === tag ? null : tag);
    }

    async function performSearch(query: string) {
        if (!query.trim()) {
            searchResultUrls = null;
            return;
        }

        if (!pagefind) return;

        isSearching = true;
        const search = await pagefind.search(query);
        if (search === null) return;

        const results = await Promise.all(search.results.map(r => r.data()));
        searchResultUrls = new Set(results.map(r => r.url));
        isSearching = false;
    }

    $effect(() => {
        performSearch(searchQuery);
    });

    function matchesSearch(post: Post) {
        const postUrl = `/blog/${post.id}/`;
        if (!searchQuery.trim()) return true;
        if (!pagefind) {
            return post.data.title.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return searchResultUrls === null || searchResultUrls.has(postUrl);
    }

    const filteredPosts = $derived(posts.filter(post => {
        const matchesTag = !activeTag || post.data.tags?.includes(activeTag);
        return matchesSearch(post) && matchesTag;
    }));

    const tagEntries = $derived(
        [...tags.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    );

    async function initPagefind() {
        const path = "/pagefind/pagefind.js";
        pagefind = await (new Function(`return import("${path}")`)()) as Pagefind;
        await pagefind.init();
    }

    onMount(() => {
        activeTag = getTagFromUrl();
        const handlePopState = () => {
            activeTag = getTagFromUrl();
        };
        window.addEventListener("popstate", handlePopState);
        initPagefind();

        return () => window.removeEventListener("popstate", handlePopState);
    });
</script>

<div class="blog-header">
    <Heading level={1} id="blog">Blog</Heading>
    <a href="/rss.xml" class="rss-link no-underline" aria-label="RSS Feed" target="_blank">
        <RSSIcon />
        <span>RSS</span>
    </a>
</div>

<div class="search-container">
    <input
        type="text"
        class="search-input"
        placeholder="Search posts..."
        bind:value={searchQuery}
    />
    {#if isSearching}
        <span class="search-spinner"></span>
    {/if}
</div>

{#if tagEntries.length > 0}
    <div class="filter-tags">
        {#each tagEntries as [tag, count] (tag)}
            <a
                href={`/blog?tag=${tag}`}
                class="tag-link no-underline"
                class:active={activeTag === tag}
                onclick={(e) => handleTagClick(e, tag)}>{tag} ({count})</a>
        {/each}
    </div>
{/if}

{#if filteredPosts.length > 0}
    <PostList posts={filteredPosts} {activeTag} onTagClick={handleTagClick} />
{:else}
    <p class="no-posts-found">No posts yet.</p>
    <p class="no-posts-found-hint">
        Subscribe to my RSS feed to get notified I write something.
    </p>
{/if}

<style>
    .blog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.5rem 0;

      :global(h1) {
        margin-block: 0;
      }
    }
    .rss-link {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.6rem;
      border-radius: var(--border-radius);
      font-size: 0.9rem;

      :global(svg) {
        width: 1rem;
        height: 1rem;
      }

      &:hover, &:focus-visible {
        background-color: var(--color-primary-hover);
        color: white;
      }
    }
    .search-container {
      position: relative;
      margin-block-end: 1rem;
    }
    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-inline-end: 2.5rem;
      font-family: inherit;
      font-size: 1rem;
      border: 2px solid var(--color-border);
      border-radius: var(--border-radius);
      background: var(--color-background);
      color: var(--color-text);

      &:focus-visible {
        outline: none;
        border-color: var(--color-primary);
      }

      &::placeholder {
        color: var(--color-text-muted);
      }
    }
    .search-spinner {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to {
        transform: translateY(-50%) rotate(360deg);
      }
    }
    .filter-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-block-end: 1rem;
    }
    .tag-link {
      font-size: 0.95rem;

      &.active {
        background-color: var(--color-primary-hover);
        color: white;
      }
    }

    .no-posts-found {
      text-align: center;
      font-size: 1.2rem;
      color: var(--color-text-muted);
      margin-block: 2rem;
      font-weight: bold;
    }

    .no-posts-found-hint {
      text-align: center;
      color: var(--color-text-muted);
      margin-block: 0.5rem;
      font-weight: lighter;
    }
</style>
