<script lang="ts">
    type NavItem = {
        name: string;
        url: string;
        target?: string;
    };

    const navItems: NavItem[] = [
        { name: "Home", url: "/" },
        { name: "Blog", url: "/blog" },
        { name: "Resume", url: "/resume.pdf", target: "_blank" },
    ];

    type Props = {
        pathname: string;
    };

    const { pathname }: Props = $props();

    function isActive(url: string): boolean {
        return url === "/" ? pathname === "/" : pathname.startsWith(url);
    }

    function getBreadcrumbSegments(path: string): { name: string; href: string }[] {
        const normalized = path.replace(/\/$/, "") || "/";

        const segments: { name: string; href: string }[] = [{ name: "Home", href: "/" }];

        if (normalized === "/") return segments;

        const parts = normalized.split("/").filter(Boolean);
        let currentPath = "";
        for (const part of parts) {
            currentPath += "/" + part;
            const name = part.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");
            segments.push({ name, href: currentPath });
        }

        return segments;
    }

    const breadcrumbSegments = $derived(getBreadcrumbSegments(pathname));
</script>

<header>
    <a href="/" class="main no-underline">
        <img src="/favicon.webp" alt="" class="pfp" />
        troy's bytes
    </a>
    <nav class="nav-items">
        {#each navItems as item (item.url)}
            <a
                href={item.url}
                class="no-underline"
                class:active={isActive(item.url)}
                target={item.target}>{item.name}</a>
        {/each}
    </nav>
</header>
<nav class="breadcrumb-bar" aria-label="Breadcrumb">
    <span class="breadcrumb">
        {#each breadcrumbSegments as segment, i (segment.href)}
            <a class="no-underline" href={segment.href}>{
                segment.name
            }</a>{#if i < breadcrumbSegments.length - 1}<span class="slash">/</span>{/if}
        {/each}
    </span>
</nav>

<style>
    .breadcrumb-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85em;
      color: var(--color-text-meta);
    }
    .breadcrumb {
      width: 100%;
      a {
        color: inherit;
        border: none;
        padding: 0;

        &:hover {
          text-decoration: underline;
          background: none;
          outline: none;
        }
      }

      .slash {
        margin-inline: 0.25rem;
      }
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-block: 2em 1em;
      line-height: 2.5em;
      gap: 1rem;

      @media (max-width: 490px) {
        justify-content: center;
      }
    }
    .main {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      margin: -0.05em -0.2em;

      .pfp {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .nav-items {
      a {
        margin: -0.05em -0.2em;
      }
    }
    nav {
      display: flex;
      align-items: center;
      gap: 0.75em;
      flex-wrap: wrap;

      .active {
        color: var(--color-primary-hover);
        border-bottom-color: var(--color-primary-hover);

        &:hover, &:focus-visible {
          color: #ffffff;
        }
      }
    }
</style>
