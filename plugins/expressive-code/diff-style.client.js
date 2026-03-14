function handleToggleClick(e) {
    const btn = e.target.closest(".diff-view-toggle button");
    if (!btn) return;

    const toggle = btn.closest(".diff-view-toggle");
    const block = btn.closest(".expressive-code");
    if (!toggle || !block) return;

    const figure = block.querySelector("figure");
    if (!figure) return;

    const view = btn.getAttribute("data-view") || btn.dataset.view || btn.textContent.toLowerCase().trim();
    toggle.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    figure.setAttribute("data-diff-view", view);

    figure.querySelectorAll("pre[data-view]").forEach(pre => {
        const preView = pre.getAttribute("data-view");
        if (preView === view) {
            pre.removeAttribute("data-no-copy");
        } else {
            pre.setAttribute("data-no-copy", "");
        }
    });
}

document.addEventListener("click", handleToggleClick);
