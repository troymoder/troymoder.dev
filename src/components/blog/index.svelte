<script lang="ts">
    import PostList from "@components/blog/PostList.svelte";
    import Heading from "@components/Heading.svelte";
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
        const postUrl = `/blog/${post.slug}/`;
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

<Heading level={1} id="blog">Blog</Heading>

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

<PostList posts={filteredPosts} {activeTag} onTagClick={handleTagClick} />

<style>
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
</style>
