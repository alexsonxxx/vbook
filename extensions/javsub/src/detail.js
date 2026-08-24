// detail.js — Thông tin chi tiết một phim
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*,
//                             format?, genres?:[{title,input,script}] }
// Thật: h1.heading__title, article p mô tả, .video__tags a.label span (genres)
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var nameEl = doc.select("h1.heading__title").first();
    var name = (nameEl ? nameEl.text() : "") + "";

    // Cover: og:image hoặc meta
    var cover = "";
    var ogEl = doc.select("meta[property=og:image]").first();
    if (ogEl) cover = (ogEl.attr("content") || "") + "";
    if (!cover) {
        var imgEl = doc.select(".player__videos img, article img").first();
        if (imgEl) cover = (imgEl.attr("src") || "") + "";
    }
    if (cover.startsWith("//")) cover = "https:" + cover;
    if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;

    // Mô tả: gộp các p trong article
    var description = "";
    var ps = doc.select("article p");
    var descParts = [];
    var pn = ps.size();
    for (var i = 0; i < pn; i++) {
        var tx = (ps.get(i).text() || "").trim() + "";
        if (tx) descParts.push(tx);
    }
    description = descParts.join("\n");

    // Genres
    var genres = [];
    doc.select(".video__tags a.label").forEach(function (el) {
        var gTitle = (el.select("span").text() || el.text() || "").trim() + "";
        var gHref = (el.attr("href") || "") + "";
        if (!gTitle || !gHref) return;
        if (!gHref.startsWith("http")) gHref = BASE_URL + gHref;
        genres.push({ title: gTitle, input: gHref.replace(/\/+$/, ""), script: "gen.js" });
    });

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: "",
        description: description,
        ongoing: false,
        format: "series",
        genres: genres
    });
}
