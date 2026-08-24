// detail.js — Chi tiết phim
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*,
//                            genres?:[{title,input,script}] }
// Thật: h1.header-title a = tên, meta[property=og:image] = cover,
//       article.block-movie-content = mô tả, #extras a[href*="/dien-vien/"] = diễn viên,
//       #extras a[href*="/the-loai/"] = thể loại (gen.js dùng ?page=N)
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var nameEl = doc.select("h1.header-title a").first();
    if (!nameEl) nameEl = doc.select("h1").first();
    var name = ((nameEl ? nameEl.text() : "") + "").trim();

    var cover = "";
    var ogEl = doc.select("meta[property=og:image]").first();
    if (ogEl) cover = (ogEl.attr("content") || "") + "";
    if (cover.indexOf("//") === 0) cover = "https:" + cover;
    if (cover && cover.indexOf("http") !== 0) cover = BASE_URL + cover;

    var actors = [];
    doc.select('#extras a[href*="/dien-vien/"]').forEach(function (el) {
        var t = ((el.attr("title") || el.text()) || "").trim() + "";
        if (t && actors.indexOf(t) === -1) actors.push(t);
    });
    var author = actors.join(", ");

    var descEl = doc.select("article.block-movie-content").first();
    var description = ((descEl ? descEl.text() : "") + "").trim();

    var genres = [];
    doc.select('#extras a[href*="/the-loai/"]').forEach(function (el) {
        var gTitle = ((el.attr("title") || el.text()) || "").trim() + "";
        var gHref = (el.attr("href") || "") + "";
        if (!gTitle || !gHref) return;
        if (!gHref.startsWith("http")) gHref = BASE_URL + gHref;
        if (gHref.slice(-1) === "/") gHref = gHref.slice(0, -1);
        genres.push({ title: gTitle, input: gHref, script: "gen.js" });
    });

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        ongoing: false,
        format: "series",
        genres: genres
    });
}
