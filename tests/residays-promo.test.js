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
    assert.match(html, /href="\/assets\/residays-promo\.css"/, `${file} must load the promo CSS`);
    assert.match(html, /src="\/assets\/residays-promo\.js\?v=20261023-2" defer/, `${file} must load the versioned promo script`);
}

const script = fs.readFileSync(path.join(root, "assets/residays-promo.js"), "utf8");
assert.match(script, /promo\.dataset\.state = "expanded"/, "the promo must start expanded on each page load");
assert.match(script, /aria-expanded/, "the collapse control must expose its state to assistive technology");
assert.doesNotMatch(script, /localStorage|sessionStorage|document\.cookie/, "collapsed state must not persist across visits");

const css = fs.readFileSync(path.join(root, "assets/residays-promo.css"), "utf8");
assert.match(css, /position:\s*fixed/, "the promo must remain fixed in the viewport");
assert.match(css, /right:\s*max\(/, "the promo must remain at the right edge with safe-area support");
assert.match(css, /border:\s*2px solid var\(--promo-navy\)/, "the expanded promo must have a navy border");
assert.match(css, /@media \(max-width: 720px\)/, "the promo must have a narrow-screen layout");

console.log(`Verified ResiDays promo on ${htmlFiles(root).length} HTML pages.`);
