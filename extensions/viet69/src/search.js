// search.js — Tìm kiếm video
// Contract: execute(key, page) → [{ name*, link*, cover?, description?, host? }], nextPage?
load("config.js");

function execute(key, page) {
    if (!page) page = "1";

    // WP rewrite đã verify: /search/{key}/ và /search/{key}/page/N/
    var base = BASE_URL + "/search/" + encodeURIComponent(key);
    var clean = base;
    while (clean.slice(-1) === "/") clean = clean.slice(0, -1);
    var pageUrl = String(page) === "1" ? clean : clean + "/page/" + parseInt(page, 10) + "/";

    var res = fetch(pageUrl);
    if (!res.ok) return Response.error("Search failed: " + res.status);

    var doc = res.html();
    var data = [];
    var seen = {};

    doc.select("div.item.item-video").forEach(function (el) {
        var linkEl = el.select("a.clip-link").first();
        if (!linkEl) return;

        var link = (linkEl.attr("href") || "") + "";
        if (!link || seen[link]) return;
        seen[link] = true;
        if (link.indexOf("http") !== 0) {
            link = link.indexOf("/") === 0 ? BASE_URL + link : BASE_URL + "/" + link;
        }

        var name = "";
        var titleA = el.select("h2.entry-title a").first();
        if (titleA) name = (titleA.text() + "").trim();
        if (!name) name = ((linkEl.attr("title") || "") + "").trim();

        var imgEl = el.select(".thumb img").first();
        var cover = imgEl ? ((imgEl.attr("src") || imgEl.attr("data-src") || "") + "") : "";

        data.push({
            name: name,
            link: link,
            cover: cover,
            description: "",
            host: BASE_URL
        });
    });

    var cur = parseInt(page, 10);
    var maxPage = cur;
    doc.select("a[href*=/page/]").forEach(function (a) {
        var m = ((a.attr("href") || "") + "").match(/\/page\/(\d+)/);
        if (m) {
            var n = parseInt(m[1], 10);
            if (n > maxPage) maxPage = n;
        }
    });
    var nextPage = maxPage > cur ? String(cur + 1) : null;

    return Response.success(data, nextPage);
}
