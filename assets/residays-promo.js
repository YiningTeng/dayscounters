(() => {
    const IMAGE_PATH = "/assets/residays-app-promo.jpg";
    function mountPromo() {
        if (document.querySelector(".residays-promo-shell")) return;
        const shell = document.createElement("aside");
        shell.className = "residays-promo-shell";
        shell.dataset.state = "expanded";
        shell.setAttribute("aria-label", "ResiDays app promotion");
        const image = document.createElement("img");
        image.className = "residays-promo-banner__image";
        image.src = IMAGE_PATH;
        image.alt = "Introducing ResiDays, the Canada and U.S. day tracker for iPhone";
        image.width = 2560;
        image.height = 768;
        image.decoding = "async";
        const collapsedLabel = document.createElement("span");
        collapsedLabel.className = "residays-promo__collapsed-label";
        collapsedLabel.setAttribute("aria-hidden", "true");
        collapsedLabel.innerHTML = '<span class="residays-promo__mark">◷</span><span>ResiDays</span>';
        const toggle = document.createElement("button");
        toggle.className = "residays-promo__toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Collapse ResiDays banner");
        toggle.textContent = "−";
        function setExpanded(expanded) {
            shell.dataset.state = expanded ? "expanded" : "collapsed";
            toggle.setAttribute("aria-expanded", String(expanded));
            toggle.setAttribute("aria-label", expanded ? "Collapse ResiDays banner" : "Expand ResiDays banner");
            toggle.textContent = expanded ? "−" : "";
            if (!expanded) toggle.append(collapsedLabel);
        }
        toggle.addEventListener("click", () => setExpanded(shell.dataset.state === "collapsed"));
        shell.append(image, toggle, collapsedLabel);
        const pageNavigation = document.body.querySelector(":scope > header, :scope > nav, :scope > .site-nav, :scope > .top-nav");
        if (pageNavigation) pageNavigation.insertAdjacentElement("beforebegin", shell);
        else document.body.prepend(shell);
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPromo, { once: true });
    else mountPromo();
})();
