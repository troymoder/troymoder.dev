function getCodeWithoutDeleted(figure) {
    const codeLines = figure.querySelectorAll(".ec-line");
    const lines = [];
    for (const line of codeLines) {
        if (!line.classList.contains("del")) {
            const codeEl = line.querySelector(".code");
            if (codeEl) {
                const clone = codeEl.cloneNode(true);
                clone.querySelectorAll(".fold-ellipsis").forEach((el) => el.remove());
                let text = clone.textContent || "";
                text = text.replace(/\n$/, "");
                lines.push(text);
            }
        }
    }
    return lines.join("\n");
}

async function handleCopy(event) {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    const figure = button.closest("figure.frame");
    if (!figure) return;

    const code = getCodeWithoutDeleted(figure);

    try {
        await navigator.clipboard.writeText(code);
    } catch {
        return;
    }

    if (button.parentNode?.querySelector(".feedback")) return;

    const liveRegion = button.parentNode?.querySelector("[aria-live]");
    const feedback = document.createElement("div");
    feedback.classList.add("feedback");
    feedback.append(button.dataset.copied || "Copied!");
    liveRegion?.append(feedback);
    requestAnimationFrame(() => feedback?.classList.add("show"));

    const hide = () => feedback?.classList.remove("show");
    const remove = () => {
        if (!feedback || parseFloat(getComputedStyle(feedback).opacity) > 0) return;
        feedback.remove();
    };
    setTimeout(hide, 1500);
    setTimeout(remove, 2500);
    button.addEventListener("blur", hide);
    feedback.addEventListener("transitioncancel", remove);
    feedback.addEventListener("transitionend", remove);
}

function init(root) {
    root.querySelectorAll?.(".expressive-code .copy button").forEach((btn) => {
        btn.addEventListener("click", handleCopy, true);
    });
}

init(document);

const observer = new MutationObserver((mutations) =>
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => init(node)))
);
observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("astro:page-load", () => init(document));
