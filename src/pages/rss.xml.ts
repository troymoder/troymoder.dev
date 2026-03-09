import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
const parser = new MarkdownIt();

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
            content: sanitizeHtml(parser.render(post.body)),
            link: `/blog/${post.slug}`,
        })),
    });
};
