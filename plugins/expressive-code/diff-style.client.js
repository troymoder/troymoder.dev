function handleToggleClick(e) {
    const btn = e.target.closest(".diff-view-toggle button");
    if (!btn) return;

    const toggle = btn.closest(".diff-view-toggle");
    const block = btn.closest(".expressive-code");
    if (!toggle || !block) return;

    const view = btn.dataset.view;
    toggle.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    block.removeAttribute("data-diff-unified");
    block.removeAttribute("data-diff-old");
    block.removeAttribute("data-diff-new");

    if (view === "unified") {
        block.setAttribute("data-diff-unified", "");
    } else if (view === "old") {
        block.setAttribute("data-diff-old", "");
    } else if (view === "new") {
        block.setAttribute("data-diff-new", "");
    }
}

document.addEventListener("click", handleToggleClick);
