import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export const GET: APIRoute = async (context) => {
    const blog = await getCollection("blog");
    return rss({
        title: "troy's bytes",
        description: "troy's dev blog",
        site: context.site!,
        trailingSlash: false,
        items: blog.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            author: "Troy Benson",
            categories: post.data.tags,
            link: `/blog/${post.id}`,
        })),
    });
};
