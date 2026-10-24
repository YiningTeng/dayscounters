const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function htmlFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.name === ".git") return [];
        if (entry.isDirectory()) return htmlFiles(fullPath);
        return entry.name.endsWith(".html") ? [fullPath] : [];
    });
}

for (const file of htmlFiles(root)) {
    const html = fs.readFileSync(file, "utf8");
    assert.match(html, /href="\/assets\/residays-promo\.css\?v=20261024-4"/, `${file} must load the versioned promo CSS`);
    assert.match(html, /src="\/assets\/residays-promo\.js\?v=20261024-4" defer/, `${file} must load the versioned promo script`);
}

const script = fs.readFileSync(path.join(root, "assets/residays-promo.js"), "utf8");
assert.match(script, /pageNavigation\.insertAdjacentElement\("beforebegin", shell\)/, "the banner must precede the page navigation");
assert.match(script, /image\.width = 2560/, "the banner must reserve its intrinsic width");
assert.match(script, /image\.height = 768/, "the banner must reserve its intrinsic height");
assert.match(script, /aria-expanded/, "the collapse control must expose its state");
assert.doesNotMatch(script, /localStorage|sessionStorage/, "collapsed state must not persist across visits");

const css = fs.readFileSync(path.join(root, "assets/residays-promo.css"), "utf8");
assert.doesNotMatch(css, /position:\s*fixed/, "the banner must stay in normal page flow");
assert.match(css, /border-bottom:\s*2px solid var\(--promo-navy\)/, "the banner must have a navy border");
assert.match(css, /width:\s*100%/, "the banner must span the page width");
assert.match(css, /@media \(max-width: 720px\)/, "the promo must have a narrow-screen layout");

console.log(`Verified ResiDays promo on ${htmlFiles(root).length} HTML pages.`);
