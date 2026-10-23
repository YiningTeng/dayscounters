(() => {
    const IMAGE_PATH = "/assets/residays-app-promo.jpg";
    const NARROW_SCREEN = "(max-width: 720px)";

    function mountPromo() {
        if (document.querySelector(".residays-promo")) return;

        const promo = document.createElement("aside");
        promo.className = "residays-promo";
        promo.dataset.state = "expanded";
        promo.setAttribute("aria-label", "ResiDays app promotion");

        const spacer = document.createElement("div");
        spacer.className = "residays-promo__spacer";
        spacer.setAttribute("aria-hidden", "true");

        const image = document.createElement("img");
        image.className = "residays-promo__image";
        image.src = IMAGE_PATH;
        image.alt = "Introducing ResiDays, the Canada and U.S. day tracker for iPhone";
        image.width = 940;
        image.height = 1672;
        image.decoding = "async";

        const collapsedLabel = document.createElement("span");
        collapsedLabel.className = "residays-promo__collapsed-label";
        collapsedLabel.setAttribute("aria-hidden", "true");
        collapsedLabel.innerHTML = '<span class="residays-promo__mark">◷</span><span>ResiDays</span>';

        const toggle = document.createElement("button");
        toggle.className = "residays-promo__toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Collapse ResiDays promotion");
        toggle.textContent = "−";

        let manuallyCollapsed = false;
        const mountedAt = performance.now();

        function setExpanded(expanded, manual = false) {
            promo.dataset.state = expanded ? "expanded" : "collapsed";
            document.documentElement.classList.toggle("residays-promo-open", expanded);
            toggle.setAttribute("aria-expanded", String(expanded));
            toggle.setAttribute("aria-label", expanded ? "Collapse ResiDays promotion" : "Expand ResiDays promotion");
            toggle.textContent = expanded ? "−" : "";
            if (!expanded) toggle.append(collapsedLabel);
            if (manual) manuallyCollapsed = !expanded;
        }

        toggle.addEventListener("click", () => {
            setExpanded(promo.dataset.state === "collapsed", true);
        });

        let ticking = false;
        function respondToScroll() {
            if (!window.matchMedia(NARROW_SCREEN).matches || manuallyCollapsed) return;
            if (performance.now() - mountedAt < 1500) return;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setExpanded(window.scrollY < 96);
                    ticking = false;
                });
                ticking = true;
            }
        }

        promo.append(image, toggle);
        document.documentElement.classList.add("residays-promo-open");
        const pageChrome = document.body.querySelector(":scope > header, :scope > nav, :scope > .site-nav, :scope > .top-nav");
        if (pageChrome) {
            pageChrome.insertAdjacentElement("afterend", spacer);
        } else {
            document.body.prepend(spacer);
        }
        document.body.append(promo);
        window.addEventListener("scroll", respondToScroll, { passive: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountPromo, { once: true });
    } else {
        mountPromo();
    }
})();
