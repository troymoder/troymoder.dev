import { toString } from "mdast-util-to-string";
import readingTime from "reading-time";

export function remarkReadingTime() {
    return function(tree, file) {
        const textOnPage = toString(tree);
        const result = readingTime(textOnPage);
        file.data.astro.frontmatter.minutesRead = result.text;
    };
}
