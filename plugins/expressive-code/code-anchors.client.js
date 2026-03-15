function parseAnchorHash(hash) {
    const decoded = decodeURIComponent(hash);
    const colonIdx = decoded.indexOf(":");
    if (colonIdx === -1) return null;

    const blockId = decoded.slice(0, colonIdx);
    const range = decoded.slice(colonIdx + 1);

    // Format: line/regex/ (single line with regex)
    // e.g., 7/"pattern"/ (line 7, match "pattern")
    const regexMatch = range.match(/^(\d+)\/(.+)\/$/);
    if (regexMatch) {
        const line = parseInt(regexMatch[1], 10);
        return {
            blockId,
            startLine: line,
            endLine: line,
            pattern: regexMatch[2],
        };
    }

    // Format: startLine-endLine (full lines)
    const lineRangeMatch = range.match(/^(\d+)-(\d+)$/);
    if (lineRangeMatch) {
        return {
            blockId,
            startLine: parseInt(lineRangeMatch[1], 10),
            endLine: parseInt(lineRangeMatch[2], 10),
            pattern: null,
        };
    }

    // Format: line (single full line)
    const singleLineMatch = range.match(/^(\d+)$/);
    if (singleLineMatch) {
        const line = parseInt(singleLineMatch[1], 10);
        return { blockId, startLine: line, endLine: line, pattern: null };
    }

    return null;
}

function clearHighlights() {
    document.querySelectorAll(".ec-line[data-anchor-highlight]").forEach(el => {
        el.removeAttribute("data-anchor-highlight");
    });
    document.querySelectorAll(".anchor-highlight-overlay").forEach(el => {
        el.remove();
    });
}

function expandFoldedRegions(block, startLine, endLine) {
    for (let i = startLine; i <= endLine; i++) {
        const line = block.querySelector(`.ec-line[data-line-num="${i - 1}"]`);
        if (!line || !line.hasAttribute("data-folded")) continue;

        let parent = line.previousElementSibling;
        while (parent) {
            if (parent.hasAttribute("data-collapsed")) {
                const foldStart = parseInt(parent.dataset.foldStart, 10);
                const foldEnd = parseInt(parent.dataset.foldEnd, 10);

                if (!isNaN(foldStart) && !isNaN(foldEnd) && i - 1 > foldStart && i - 1 <= foldEnd) {
                    parent.removeAttribute("data-collapsed");

                    for (let j = foldStart + 1; j <= foldEnd; j++) {
                        const foldedLine = block.querySelector(`.ec-line[data-line-num="${j}"]`);
                        if (foldedLine && !foldedLine.hasAttribute("data-collapsed")) {
                            foldedLine.removeAttribute("data-folded");
                        }
                    }
                    break;
                }
            }
            parent = parent.previousElementSibling;
        }
    }
}

function getCodeText(node) {
    let text = "";
    for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            if (child.hasAttribute("data-no-copy") || child.classList.contains("hover-tooltip")) {
                continue;
            }
            text += getCodeText(child);
        }
    }
    return text;
}

function findTextMatch(codeDiv, pattern) {
    const text = getCodeText(codeDiv);
    const regex = new RegExp(pattern);
    const match = text.match(regex);
    if (!match) return null;

    const startIdx = match.index;
    const endIdx = startIdx + match[0].length;
    return { startIdx, endIdx };
}

function findTextPosition(codeDiv, charIndex) {
    let currentChar = 0;

    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const len = node.textContent.length;
            if (currentChar + len >= charIndex) {
                return { node, offset: charIndex - currentChar };
            }
            currentChar += len;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.hasAttribute("data-no-copy") || node.classList.contains("hover-tooltip")) {
                return null;
            }
            for (const child of node.childNodes) {
                const result = walk(child);
                if (result) return result;
            }
        }
        return null;
    }

    return walk(codeDiv);
}

function createOverlay(codeDiv, startIdx, endIdx) {
    const startPos = findTextPosition(codeDiv, startIdx);
    const endPos = findTextPosition(codeDiv, endIdx);

    if (!startPos || !endPos) return null;

    const range = document.createRange();
    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);

    const rects = range.getClientRects();
    if (rects.length === 0) return null;

    const codeDivRect = codeDiv.getBoundingClientRect();
    const firstRect = rects[0];
    const lastRect = rects[rects.length - 1];

    const left = firstRect.left - codeDivRect.left;
    const width = (lastRect.right - codeDivRect.left) - left;

    const overlay = document.createElement("span");
    overlay.className = "anchor-highlight-overlay";
    overlay.style.left = `${left}px`;
    overlay.style.width = `${width}px`;
    codeDiv.appendChild(overlay);
    return overlay;
}

function highlightRange(parsed) {
    const { blockId, startLine, endLine, pattern } = parsed;
    const block = document.getElementById(blockId);
    if (!block) return false;

    expandFoldedRegions(block, startLine, endLine);

    for (let i = startLine; i <= endLine; i++) {
        const line = block.querySelector(`.ec-line[data-line-num="${i - 1}"]`);
        if (!line) continue;

        const codeDiv = line.querySelector(".code");
        if (!codeDiv) continue;

        if (pattern) {
            const match = findTextMatch(codeDiv, pattern);
            if (match) {
                line.setAttribute("data-anchor-highlight", "partial");
                const overlay = createOverlay(codeDiv, match.startIdx, match.endIdx);
                if (overlay) {
                    overlay.style.animation = "none";
                    overlay.style.animation = "";
                }
            }
        } else {
            line.style.animation = "none";
            line.style.animation = "";
            line.setAttribute("data-anchor-highlight", "full");
        }
    }

    const firstLine = block.querySelector(`.ec-line[data-line-num="${startLine - 1}"]`);
    if (firstLine) {
        firstLine.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    return true;
}

function handleLinkClick(e) {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;

    const hash = link.getAttribute("href").slice(1);
    const parsed = parseAnchorHash(hash);
    if (!parsed) return;

    e.preventDefault();

    clearHighlights();
    highlightRange(parsed);
}

document.addEventListener("click", handleLinkClick);
