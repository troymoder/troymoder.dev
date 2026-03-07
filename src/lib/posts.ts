import { type CollectionEntry, getCollection } from "astro:content";

export type Post = CollectionEntry<"blog"> & {
    data: {
        minutesRead: string;
    };
};

export async function getPosts() {
    const posts: Post[] = await getCollection("blog");

    for (const post of posts) {
        const { remarkPluginFrontmatter } = await post.render();
        post.data.minutesRead = remarkPluginFrontmatter.minutesRead;
    }

    return posts;
}
