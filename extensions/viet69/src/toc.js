// toc.js — Mục lục tập: site là video lẻ nên mỗi detail = 1 "tập"
// Contract: execute(url) → [{ name*, url*, host? }]
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var nameEl = doc.select("h2.siteheading").first();
    var name = nameEl ? (nameEl.text() + "").trim() : "";

    var chapters = [{
        name: name || "Full",
        url: url,
        host: BASE_URL
    }];

    return Response.success(chapters);
}
