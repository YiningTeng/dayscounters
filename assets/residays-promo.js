(() => {
    const IMAGE_PATH = "/assets/residays-app-promo.jpg";

    function mountPromo() {
        if (document.querySelector(".residays-promo-banner")) return;

        const banner = document.createElement("aside");
        banner.className = "residays-promo-banner";
        banner.setAttribute("aria-label", "ResiDays app promotion");

        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "residays-promo-banner__toggle";
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Collapse banner");
        toggle.innerHTML = '<span aria-hidden="true">↑</span>';

        const image = document.createElement("img");
        image.className = "residays-promo-banner__image";
        image.src = IMAGE_PATH;
        image.alt = "Introducing ResiDays, the Canada and U.S. day tracker for iPhone";
        image.width = 1280;
        image.height = 548;
        image.decoding = "async";

        banner.append(toggle, image);

        const pageNavigation = document.body.querySelector(":scope > header, :scope > nav, :scope > .site-nav, :scope > .top-nav");
        if (pageNavigation) {
            document.body.insertBefore(banner, pageNavigation);
        } else {
            document.body.prepend(banner);
        }

        toggle.addEventListener("click", () => {
            const isCollapsed = banner.classList.toggle("residays-promo-banner--collapsed");
            toggle.setAttribute("aria-expanded", String(!isCollapsed));
            toggle.setAttribute("aria-label", isCollapsed ? "Expand banner" : "Collapse banner");
            toggle.innerHTML = `<span aria-hidden="true">${isCollapsed ? "↓" : "↑"}</span>`;
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountPromo, { once: true });
    } else {
        mountPromo();
    }
})();
