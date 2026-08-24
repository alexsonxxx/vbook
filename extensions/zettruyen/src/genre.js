// genre.js — Danh sách thể loại
// Contract: execute() → [{ title, input, script }]
load("config.js");

function execute() {
    var res = fetch(BASE_URL + "/the-loai");
    if (!res.ok) return Response.error("Cannot load genres");

    var doc = res.html();
    var genres = [];
    var seen = {};

    doc.select("a[href*=\"/the-loai/\"]").forEach(function(el) {
        var title = el.text().trim() + "";
        var href  = (el.attr("href") || "") + "";
        if (!title || !href) return;
        if (!href.startsWith("http")) href = BASE_URL + href;
        if (seen[href]) return;
        seen[href] = true;
        genres.push({ title: title, input: href + "?page={{page}}", script: "gen.js" });
    });

    return Response.success(genres);
}