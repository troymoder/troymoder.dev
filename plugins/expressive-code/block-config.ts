import { AttachedPluginData, type ExpressiveCodePlugin } from "astro-expressive-code";

export interface BlockConfigSection {
    name: string;
    lines: string[];
}

interface PluginBlockConfigData {
    sections: BlockConfigSection[];
    configLineCount: number;
}

export const pluginBlockConfigData = new AttachedPluginData<PluginBlockConfigData>(
    () => ({ sections: [], configLineCount: 0 }),
);

export function getSection(sections: BlockConfigSection[], name: string): string[] | undefined {
    return sections.find(s => s.name === name)?.lines;
}

function parseConfigBlock(lines: string[]): { sections: BlockConfigSection[]; configLineCount: number } {
    const firstLine = lines[0]?.trim();
    if (!firstLine?.startsWith(":::")) {
        return { sections: [], configLineCount: 0 };
    }

    const sections: BlockConfigSection[] = [];
    let currentSection: string | null = null;
    let currentContent: string[] = [];
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const trimmed = line.trim();

        if (trimmed === ":::") {
            if (currentSection) {
                sections.push({ name: currentSection, lines: currentContent });
            }
            endIndex = i;
            break;
        }

        if (trimmed.startsWith("::: ")) {
            if (currentSection) {
                sections.push({ name: currentSection, lines: currentContent });
            }
            currentSection = trimmed.slice(4).trim();
            currentContent = [];
        } else if (currentSection) {
            currentContent.push(line);
        }
    }

    if (endIndex === -1) {
        return { sections: [], configLineCount: 0 };
    }

    return { sections, configLineCount: endIndex + 1 };
}

export function pluginBlockConfig(): ExpressiveCodePlugin {
    return {
        name: "block-config",
        hooks: {
            preprocessCode: ({ codeBlock }) => {
                const lines = codeBlock.getLines().map((line) => line.text);
                const { sections, configLineCount } = parseConfigBlock(lines);

                if (configLineCount === 0) return;

                const data = pluginBlockConfigData.getOrCreateFor(codeBlock);
                data.sections = sections;
                data.configLineCount = configLineCount;

                for (let i = 0; i < configLineCount; i++) {
                    codeBlock.deleteLine(0);
                }
            },
        },
    };
}
