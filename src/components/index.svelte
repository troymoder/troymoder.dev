<script lang="ts">
    import PostList from "@components/blog/PostList.svelte";
    import ExternalLink from "@components/ExternalLink.svelte";
    import Heading from "@components/Heading.svelte";
    import type { Post } from "@lib/posts";
    import type { CollectionEntry } from "astro:content";

    type Props = {
        posts: Post[];
        projects: CollectionEntry<"projects">[];
    };

    const { posts: allPosts, projects }: Props = $props();

    const posts = $derived(
        allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()).slice(0, 2),
    );
</script>

<Heading id="about">About</Heading>
<p>
    Welcome to my corner of the internet!
</p>
<p>
    My name is Troy, a software engineer who enjoys infrastructure. Currently working at
    <ExternalLink href="https://paravision.ai">Paravision</ExternalLink>, where I preform various
    roles but mainly working on our facial recognition software.
</p>
<p>
    I have a <ExternalLink href="/bailey3.webp">border collie</ExternalLink>
    <ExternalLink href="/bailey4.webp">puppy</ExternalLink> named
    <ExternalLink href="/bailey1.webp">Bailey</ExternalLink>. He is a very
    <ExternalLink href="/bailey2.webp">good boy</ExternalLink>. I love listening to
    <ExternalLink href="https://www.last.fm/user/TroyDota">music</ExternalLink>, and programming. I
    occasionally go live on
    <ExternalLink href="https://twitch.tv/troymoder">twitch</ExternalLink>. Once in a blue moon I
    play a game of
    <ExternalLink href="https://www.dota2.com/">Dota 2</ExternalLink>.
</p>
<p>
    I'm a <ExternalLink href="https://nixos.org/">nixos</ExternalLink> enjoyer and use it to manage
    <ExternalLink href="https://github.com/troymoder/dotfiles">my systems</ExternalLink>.
</p>

<Heading id="projects">Projects</Heading>

<ul class="projects">
    {#each projects as project (project.data.name)}
        <li class="project">
            <span class="project-title">
                <ExternalLink href={project.data.url}>
                    <span class="project-name">{project.data.name}</span>
                </ExternalLink><span class="project-colon">:</span>
                <span class="project-tagline">{project.data.tagLine}</span>
            </span>
            {#if project.data.links}
                <span class="project-links">
                    {#each project.data.links as link, i (link.name)}
                        <ExternalLink href={link.url}>{link.name}</ExternalLink>
                        {#if i < project.data.links.length - 1}
                            <span class="project-link-separator">|</span>
                        {/if}
                    {/each}
                </span>
            {/if}
            <div class="project-description">
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html project.rendered?.html ?? ""}
            </div>
        </li>
    {/each}
</ul>

<Heading id="socials">Other places you can find me</Heading>
<ul>
    <li>
        all my code is on <ExternalLink href="https://github.com/TroyKomodo">github</ExternalLink>
    </li>
    <li>
        contact me via <ExternalLink href="mailto:me@troymoder.dev">email</ExternalLink>
    </li>
    <li>
        sometimes catch me on <ExternalLink href="https://x.com/troykomodo">twitter</ExternalLink>
    </li>
    <li>
        occasionally stream on <ExternalLink
            href="https://twitch.tv/troymoder">twitch</ExternalLink>
    </li>
    <li>
        photos on <ExternalLink
            href="https://www.instagram.com/troyzzzzzzz">instagram</ExternalLink>
    </li>
</ul>

<Heading id="recent-posts">Recent Posts</Heading>
<PostList {posts} showReadMore={false} />
<a href="/blog" class="no-underline">All posts ⤴</a>

<Heading id="ai">Stance on AI</Heading>
<p>
    I think LLMs / coding assistants are very powerful tools when used correctly. AI in the hands of
    an experienced developer can be extremely productive. I have an issue with people who misuse AI
    to write code they do not understand ("ai slop") and generative AI is in terms of "art" is
    disgusting and gross. I think using LLMs to generate blogs and messages to other people trying
    to pass off as their own work is abhorrent. Anyone who has any critical thinking skills should
    be aware that we are currently in an ai-bubble, the tech & investor industry believes generative
    AI to be far more useful than it actually is. I believe that sometime in the near future we are
    going to have a massive crash and a lot of (good and some bad) companies will go out of
    business.
</p>

<Heading id="credits">Credits</Heading>
<p>
    This <ExternalLink href="https://github.com/troymoder/troymoder.dev">website</ExternalLink> was
    made with <ExternalLink href="https://astro.build/">Astro</ExternalLink> and
    <ExternalLink href="https://svelte.dev/">Svelte</ExternalLink>. The theme was inspired by
    <ExternalLink href="https://github.com/athul/archie">archie</ExternalLink>,
    <ExternalLink href="https://www.elizas.website/">eliza</ExternalLink>, and
    <ExternalLink href="https://www.nan.fyi/">nan</ExternalLink>.
</p>

<style>
    .projects {
      padding: 0;
    }

    .project {
      padding: 0;
      margin-bottom: 1.3em;
    }

    .project-title {
      margin-right: auto;
    }

    .project-name {
      text-decoration: underline;
    }

    .project-colon {
      color: black;
      font-weight: bold;
      margin-inline-start: -0.15em;
    }

    .project-tagline {
      color: black;
      font-size: 0.9em;
      font-weight: bold;
      margin-inline-start: -0.5em;
    }

    .project-description {
      color: var(--color-text-muted);
      display: block;
      padding-inline-start: 1.4em;
      order: 3;
      width: 100%;
    }

    .project-links {
      display: flex;
      font-size: 0.9em;
      float: right;
      color: black;
      &::before {
        content: "(";
      }
      &::after {
        content: ")";
      }
    }
</style>
