import { getCollection } from "astro:content";

export async function getProjects() {
    const projects = await getCollection("project");
    return projects.sort((a, b) => a.data.order - b.data.order);
}
