(() => {
    function handleToggleClick(e) {
        const diffBlock = e.currentTarget.closest(".diff-block");
        if (!diffBlock) return;
        diffBlock.dataset.diffMode = diffBlock.dataset.diffMode === "diff" ? "plain" : "diff";
    }

    function init() {
        for (const btn of document.querySelectorAll(".diff-toggle-btn")) {
            btn.removeEventListener("click", handleToggleClick);
            btn.addEventListener("click", handleToggleClick);
        }
    }

    init();
    document.addEventListener("astro:page-load", init);
})();
