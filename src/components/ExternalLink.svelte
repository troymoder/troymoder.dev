<script lang="ts">
    import type { Snippet } from "svelte";

    type Props = {
        href: string;
        children: Snippet;
    };

    const { href, children }: Props = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer">{@render children()}</a>
