(() => {
    function getCodeText(container) {
        const clone = container.cloneNode(true);
        clone.querySelectorAll("[data-no-copy]").forEach((el) => el.remove());

        const lines = [];
        for (const line of clone.querySelectorAll(".ec-line")) {
            const codeEl = line.querySelector(".code");
            if (codeEl) {
                lines.push(codeEl.textContent?.replace(/\n$/, "") || "");
            }
        }
        return lines.join("\n");
    }

    async function handleCopyClick(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const container = btn.closest(".expressive-code");
        if (!container) return;

        try {
            await navigator.clipboard.writeText(getCodeText(container));
        } catch {
            return;
        }

        const feedback = btn.parentNode?.querySelector(".copy-feedback");
        if (!feedback || feedback.classList.contains("show")) return;

        feedback.classList.add("show");
        setTimeout(() => feedback.classList.remove("show"), 1500);
    }

    function init() {
        for (const btn of document.querySelectorAll(".expressive-code .copy-button")) {
            btn.removeEventListener("click", handleCopyClick);
            btn.addEventListener("click", handleCopyClick);
        }
    }

    init();
    document.addEventListener("astro:page-load", init);
})();
