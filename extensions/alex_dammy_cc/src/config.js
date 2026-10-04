// config.js — shared helpers for the dammy.cc extension.
// Every script load('config.js') so these are available everywhere.
// Rhino runtime: plain ES5 only (var, no optional chaining, no nullish
// coalescing, no promise syntax, no spread).

var BASE_URL = "https://dammy.cc";

try {
    if (DOMAIN) {
        BASE_URL = DOMAIN;
    }
} catch (error) {}

// Rewrite an incoming url's host (old/mirror/www-prefixed) to BASE_URL,
// keeping path/query. Call this first thing in every url-receiving execute().
function normalizeUrl(url) {
    var s = String(url || "");
    if (!s) return "";
    if (s.indexOf("http") !== 0) s = BASE_URL + (s.charAt(0) === "/" ? s : "/" + s);
    return s.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im, BASE_URL);
}

// dammy.cc hides some words inside the text as empty <span class="x-hash"></span>
// and a <style> block maps each class to the real word via `:before { content }`.
// buildCssMap() reads that style block, deobfuscate() puts the words back.
function buildCssMap(html) {
    var map = {};
    if (!html) return map;
    var re = /\.([A-Za-z0-9_-]+):before\s*\{\s*content:\s*"([^"]*)"\s*;?\s*\}/g;
    var m;
    while ((m = re.exec(html)) !== null) {
        map[m[1]] = m[2];
    }
    return map;
}

function deobfuscate(html, map) {
    if (!html) return "";
    if (!map) return html;
    var re = /<span\s+class="([A-Za-z0-9_-]+)"[^>]*><\/span>/g;
    var out = [];
    var last = 0;
    var m;
    while ((m = re.exec(html)) !== null) {
        var w = map[m[1]];
        if (w === undefined || w === null) continue;
        out.push(html.slice(last, m.index));
        out.push(w);
        last = m.index + m[0].length;
    }
    out.push(html.slice(last));
    return out.join("");
}

// dammy.cc obfuscates the text twice. First it replaces words with empty
// <span class="x-hash"></span> and a <style> block maps each class back to the
// real word via `:before { content }` (see buildCssMap/deobfuscate). Second it
// injects a literal "." inside random words ("máu" -> "m.á.u"). A dot with a
// letter on both sides is never legitimate here, so drop it — but only in text,
// never inside a tag, otherwise urls, class names and the doctype lose dots too.
function stripWordDots(html) {
    if (!html) return "";
    var parts = String(html).split(/(<[^>]*>)/g);
    for (var i = 0; i < parts.length; i++) {
        if (i % 2 === 1) continue;
        parts[i] = parts[i].replace(/([A-Za-z\u00C0-\u1EF9])\.(?=[A-Za-z\u00C0-\u1EF9])/g, "$1");
    }
    return parts.join("");
}

// Absolute url from a possibly-relative href.
function normalizeLink(href) {
    var s = String(href || "");
    if (!s) return "";
    if (s.indexOf("javascript") === 0) return "";
    if (s.indexOf("http") === 0) return s;
    if (s.charAt(0) === "/") return BASE_URL + s;
    return BASE_URL + "/" + s;
}

// dammy.cc lazy-loads covers: the real image is in data-src, src is a placeholder.
function pickCover(el) {
    var img = el.select("img.card-img-top").first();
    if (!img) img = el.select("img").first();
    if (!img) return "";
    var u = String(img.attr("data-src") || "");
    if (!u) u = String(img.attr("src") || "");
    if (u.indexOf("ajax-loading") >= 0) u = "";
    if (u.indexOf("//") === 0) u = "https:" + u;
    return u;
}

// Parse a listing/search page card into a book item.
function parseCard(card) {
    var titleEl = card.select(".story-item-title").first();
    var name = "";
    var link = "";
    if (titleEl) {
        name = String(titleEl.text() || "").trim();
    }
    var a = card.select("a").first();
    if (a) {
        link = normalizeLink(a.attr("href"));
        if (!name) {
            var imgA = card.select("img.card-img-top").first();
            if (imgA) name = String(imgA.attr("alt") || "").trim();
        }
    }
    if (!name || !link) return null;

    var desc = String(card.select(".story-item-excerpt").text() || "").trim();
    var tag = "";
    if (card.select(".is-full").size() > 0) {
        tag = "Hoàn thành";
    } else {
        var chap = card.select(".chapter a").first();
        if (chap) tag = String(chap.text() || "").trim();
    }

    return {
        name: name,
        link: link,
        cover: pickCover(card),
        description: desc,
        tag: tag,
        host: BASE_URL
    };
}

function parseCards(doc) {
    var items = [];
    var cards = doc.select(".row.product-grid .card");
    cards.forEach(function (card) {
        var item = parseCard(card);
        if (item) items.push(item);
    });
    return items;
}

// The "next page" arrow is the pagination link holding a bx-chevrons-right icon.
// On the last page it is disabled and points to "javascript:;".
function hasNextPage(doc) {
    var links = doc.select("ul.pagination a.page-link");
    for (var i = 0; i < links.size(); i++) {
        var a = links.get(i);
        var inner = String(a.html() || "");
        if (inner.indexOf("chevrons-right") >= 0) {
            var href = String(a.attr("href") || "");
            if (href.indexOf("http") === 0) return true;
        }
    }
    return false;
}

// Build the listing url for a category input (path or full url) + page number.
function categoryUrl(input, page) {
    var s = String(input || "").trim();
    if (!s) return "";
    var path;
    if (s.indexOf("http") === 0) {
        var m = s.match(/^https?:\/\/[^\/]+(.*)$/i);
        path = m ? m[1] : "/";
    } else {
        path = s.charAt(0) === "/" ? s : "/" + s;
    }
    path = path.split("?")[0].split("#")[0];
    while (path.length > 1 && path.charAt(path.length - 1) === "/") {
        path = path.slice(0, -1);
    }
    var n = parseInt(page, 10);
    if (isNaN(n)) n = 1;
    return BASE_URL + path + "?page=" + n;
}

function nextPageToken(page) {
    var n = parseInt(page, 10);
    if (isNaN(n)) n = 1;
    return String(n + 1);
}
