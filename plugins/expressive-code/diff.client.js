(() => {
    function handleToggleClick(e) {
        const btn = e.currentTarget;
        const mode = btn.dataset.mode;
        const diffBlock = btn.closest(".diff-block");
        if (!diffBlock || !mode) return;

        diffBlock.dataset.diffMode = mode;

        const wrapper = btn.parentNode;
        if (!wrapper) return;

        for (const sibling of wrapper.querySelectorAll(".diff-toggle-btn")) {
            sibling.classList.toggle("active", sibling.dataset.mode === mode);
        }
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
