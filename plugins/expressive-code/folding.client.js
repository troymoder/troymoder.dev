(() => {
    function toggleFold(line) {
        const start = parseInt(line.dataset.foldStart, 10);
        const end = parseInt(line.dataset.foldEnd, 10);
        if (isNaN(start) || isNaN(end)) return;

        const codeBlock = line.closest(".expressive-code");
        if (!codeBlock) return;

        const isCollapsed = line.hasAttribute("data-collapsed");

        if (isCollapsed) {
            line.removeAttribute("data-collapsed");

            const collapsedRegions = [];
            for (let i = start + 1; i <= end; i++) {
                const foldedLine = codeBlock.querySelector(`.ec-line[data-line-num="${i}"]`);
                if (foldedLine?.hasAttribute("data-collapsed")) {
                    const innerStart = parseInt(foldedLine.dataset.foldStart, 10);
                    const innerEnd = parseInt(foldedLine.dataset.foldEnd, 10);
                    if (!isNaN(innerStart) && !isNaN(innerEnd)) {
                        collapsedRegions.push({ start: innerStart, end: innerEnd });
                    }
                }
            }

            for (let i = start + 1; i <= end; i++) {
                const isInsideCollapsed = collapsedRegions.some(
                    r => i > r.start && i <= r.end,
                );
                if (isInsideCollapsed) continue;

                const foldedLine = codeBlock.querySelector(`.ec-line[data-line-num="${i}"]`);
                if (foldedLine) {
                    foldedLine.removeAttribute("data-folded");
                }
            }
        } else {
            line.setAttribute("data-collapsed", "");
            for (let i = start + 1; i <= end; i++) {
                const foldedLine = codeBlock.querySelector(`.ec-line[data-line-num="${i}"]`);
                if (foldedLine) {
                    foldedLine.setAttribute("data-folded", "");
                }
            }
        }
    }

    function handleFoldClick(e) {
        const target = e.target;
        if (!(target instanceof HTMLElement)) return;

        const chevron = target.closest(".fold-chevron");
        const ellipsis = target.closest(".fold-ellipsis");

        if (chevron) {
            const line = chevron.closest(".ec-line");
            if (line) toggleFold(line);
        } else if (ellipsis) {
            const line = ellipsis.closest(".ec-line");
            if (line) toggleFold(line);
        }
    }

    document.addEventListener("click", handleFoldClick);
    document.addEventListener("astro:page-load", () => {
        document.removeEventListener("click", handleFoldClick);
        document.addEventListener("click", handleFoldClick);
    });
})();
