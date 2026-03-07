<script lang="ts">
    import PostList from "@components/blog/PostList.svelte";
    import Heading from "@components/Heading.svelte";
    import type { Post } from "@lib/posts";

    type Props = {
        posts: Post[];
    };

    const { posts: allPosts }: Props = $props();

    const posts = $derived(
        allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()).slice(0, 2),
    );

    type Project = {
        name: string;
        url: string;
        tagLine: string;
        description: string;
        links?: {
            name: string;
            url: string;
        }[];
    };

    const projects: Project[] = [
        {
            name: "bolt",
            tagLine: "Starlark based build system",
            description: `
                Bolt is a general build system that uses Starlark as its configuration language.
                It is in the very early stages of development and is not yet ready for production use. 
                This project is a learning project for me. The goals are to be a general purpose build system that
                can be easily extended, understood and fully compatiable with the remote build protocol. 
                Inspired by <a href="https://bazel.build" target="_blank">Bazel</a> and <a href="https://buck2.build" target="_blank">Buck2</a>.
            `,
            url: "https://github.com/troymoder/bolt",
            links: [
                { name: "github", url: "https://github.com/troymoder/bolt" },
            ],
        },
        {
            name: "tinc",
            tagLine: "gRPC-REST transcoding library for Rust",
            description: `
                I created tinc as a way to easily have both a gRPC API and REST API
                without needing to duplicate the same code. tinc was inspired by
                <a href="https://cloud.google.com/endpoints/docs/grpc/transcoding" target="_blank">Google's gRPC-REST transcoding</a>, 
                <a href="https://github.com/grpc-ecosystem/grpc-gateway" target="_blank">grpc-gateway</a>, and <a href="https://github.com/bufbuild/buf" target="_blank">buf</a>.
                It has support for custom validation logic using <a href="https://github.com/google/cel-spec" target="_blank">CEL expressions</a>, 
                and generates <a href="https://spec.openapis.org/oas/v3.1.0" target="_blank">OpenAPI 3.1</a> and 
                <a href="https://json-schema.org/" target="_blank">JSON Schema</a> documents for the REST API.
            `,
            url: "https://github.com/troymoder/crates/tree/main/tinc",
            links: [
                { name: "crates.io", url: "https://crates.io/crates/tinc" },
                { name: "docs.rs", url: "https://docs.rs/tinc" },
            ],
        },
        {
            name: "postcompile",
            tagLine: "Generated code testing tool for Rust",
            description: `
                postcompile, as the name suggests, is a tool for invoking the Rust compiler after a build has completed.
                It allows you to run tests or assert that generated code compiles when writing procedural macros. 
                What's unique about this project compared to other tools like <a href="https://github.com/dtolnay/trybuild" target="_blank">trybuild</a> 
                is that it works with <a href="https://doc.rust-lang.org/rustc/tests/index.html" target="_blank">libtest</a> and embeds into regular <code>#[test]</code> functions. 
                It also has support for running the compiled code and testing external crate dependencies.
            `,
            url: "https://github.com/troymoder/crates/tree/main/postcompile",
            links: [
                { name: "crates.io", url: "https://crates.io/crates/postcompile" },
                { name: "docs.rs", url: "https://docs.rs/postcompile" },
            ],
        },
        {
            name: "brawl",
            tagLine: "GitHub merge queue bot",
            description: `
                Brawl is a GitHub merge queue bot which helps teams manage pull requests and ensures code works after merging to main.
                Inspired by <a href="https://bors.tech/" target="_blank">bors</a> and the <a href="https://github.com/rust-lang/bors" target="_blank">rust-lang bors</a> implementation.
            `,
            url: "https://github.com/troymoder/brawl",
            links: [
                { name: "github", url: "https://github.com/troymoder/brawl" },
            ],
        },
        {
            name: "Scuffle",
            tagLine: "Open source video cloud platform",
            description: `
                Scuffle is an open source video cloud platform that allows you to upload, store, and stream videos.
                It's built with Rust and is designed to be easy to deploy and scale.
            `,
            url: "https://github.com/scufflecloud/scuffle",
            links: [
                { name: "github", url: "https://github.com/scufflecloud/scuffle" },
                { name: "website", url: "https://www.scuffle.cloud/" },
            ],
        },
        {
            name: "7TV",
            tagLine: "Emote service for Twitch",
            description: `
                I was the lead developer and co-founder of 7TV.
                7TV was a passion project that I joined very early on and helped grow it to what it is today.
                At the time I left it was distrubuting ~2PB of image data every month across over 50B requests. 
                Generating around $1'000'000 in yearly revenue.
            `,
            url: "https://7tv.app/",
            links: [
                { name: "github", url: "https://github.com/seventv/seventv" },
                { name: "website", url: "https://7tv.app/" },
            ],
        },
    ];
</script>

<Heading id="about">About</Heading>
<p>
    Welcome to my corner of the internet!
    <br />
    <br />
    My name is Troy, a software engineer who enjoys infrastructure. Currently working at <a
        href="https://paravision.ai"
        target="_blank">Paravision</a>, where I preform various roles but mainly working on our
    facial recognition software.
    <br />
    <br />
    I have a <a href="/bailey3.webp" target="_blank">border collie</a> <a
        href="/bailey4.webp"
        target="_blank">puppy</a> named <a href="/bailey1.webp" target="_blank">Bailey</a>. He is a
    very <a href="/bailey2.webp" target="_blank">good boy</a>. I love listening to <a
        href="https://www.last.fm/user/TroyDota"
        target="_blank">music</a>, and programming. I occasionally go live on <a
        href="https://twitch.tv/troymoder"
        target="_blank">twitch</a>. Once in a blue moon I play a game of <a
        href="https://www.dota2.com/"
        target="_blank">Dota 2</a>.
    <br />
    <br />
    I'm a <a href="https://nixos.org/" target="_blank">nixos</a> enjoyer and use it to manage <a
        href="https://github.com/troymoder/dotfiles"
        target="_blank">my systems</a>.
</p>

<Heading id="projects">Projects</Heading>

<ul class="projects">
    {#each projects as project}
        <li class="project">
            <span class="project-title">
                <a href={project.url} class="project-name" target="_blank">{project.name}</a><span
                    class="project-colon">:</span>
                <span class="project-tagline">{project.tagLine}</span>
            </span>
            {#if project.links}
                <span class="project-links">
                    {#each project.links as link, i}
                        <a href={link.url} target="_blank">{link.name}</a>
                        {#if i < project.links.length - 1}
                            <span class="project-link-separator">|</span>
                        {/if}
                    {/each}
                </span>
            {/if}
            <p class="project-description">
                {@html project.description}
            </p>
        </li>
    {/each}
</ul>

<Heading id="socials">Other places you can find me</Heading>
<ul>
    <li>
        all my code is on <a href="https://github.com/TroyKomodo" target="_blank">github</a>
    </li>
    <li>
        contact me via <a href="mailto:me@troymoder.dev" target="_blank">email</a>
    </li>
    <li>
        sometimes catch me on <a href="https://x.com/troykomodo" target="_blank">twitter</a>
    </li>
    <li>
        occasionally stream on <a href="https://twitch.tv/troymoder" target="_blank">twitch</a>
    </li>
    <li>
        photos on <a href="https://www.instagram.com/troyzzzzzzz" target="_blank">instagram</a>
    </li>
</ul>

<Heading id="recent-posts">Recent Posts</Heading>
<PostList {posts} showReadMore={false} />
<a href="/blog" class="no-underline">All posts ⤴</a>

<Heading id="ai">Stance on AI</Heading>
<p>
    I think LLMs / coding assistants are very powerful tools when used correctly. AI in the hands of
    an experienced developer can be extremely productive. I have an issue with people who misuse AI
    to write code they do not understand (“ai slop”) and generative AI is in terms of “art” is
    disgusting and gross. I think using LLMs to generate blogs and messages to other people trying
    to pass off as their own work is abhorrent. Anyone who has any critical thinking skills should
    be aware that we are currently in an ai-bubble, the tech & investor industry believes generative
    AI to be far more useful than it actually is. I believe that sometime in the near future we are
    going to have a massive crash and a lot of (good and some bad) companies will go out of
    business.
</p>

<Heading id="credits">Credits</Heading>
<p>
    This <a href="https://github.com/troymoder/troymoder.dev" target="_blank">website</a> was made
    with
    <a href="https://astro.build/" target="_blank">Astro</a> and <a
        href="https://svelte.dev/"
        target="_blank">Svelte</a>. The theme was inspired by <a
        href="https://github.com/athul/archie"
        target="_blank">archie</a>, <a href="https://www.elizas.website/" target="_blank">eliza</a>,
    and <a href="https://www.nan.fyi/" target="_blank">nan</a>.
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
