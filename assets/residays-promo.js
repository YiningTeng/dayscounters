(() => {
    const IMAGE_PATH = "/assets/residays-app-promo.svg";

    function mountPromo() {
        if (document.querySelector(".residays-promo-banner")) return;

        const banner = document.createElement("aside");
        banner.className = "residays-promo-banner";
        banner.setAttribute("aria-label", "ResiDays app promotion");

        const image = document.createElement("img");
        image.className = "residays-promo-banner__image";
        image.src = IMAGE_PATH;
        image.alt = "Introducing ResiDays, the Canada and U.S. day tracker for iPhone";
        image.width = 1280;
        image.height = 548;
        image.decoding = "async";

        banner.append(image);

        const pageNavigation = document.body.querySelector(":scope > header, :scope > nav, :scope > .site-nav, :scope > .top-nav");
        if (pageNavigation) {
            pageNavigation.insertAdjacentElement("afterend", banner);
        } else {
            document.body.prepend(banner);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountPromo, { once: true });
    } else {
        mountPromo();
    }
})();
