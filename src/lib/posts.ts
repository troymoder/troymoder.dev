import { type CollectionEntry, getCollection, render } from "astro:content";

export type Post = CollectionEntry<"blog"> & {
    data: {
        minutesRead: string;
    };
};

export async function getPosts() {
    const posts: Post[] = await getCollection("blog");

    for (const post of posts) {
        const { remarkPluginFrontmatter } = await render(post);
        post.data.minutesRead = remarkPluginFrontmatter.minutesRead;
    }

    return posts;
}
