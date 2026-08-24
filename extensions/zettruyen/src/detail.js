// detail.js — Thông tin chi tiết một bộ truyện tranh
// Contract: execute(url) → { name*, cover, host, author, description, ongoing:bool*,
//                             genres?:[{title,input,script}], suggests?:[{title,input,script}] }
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) === "/") url = url.slice(0, -1);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var nameEl = doc.select("h1").first();
    var name = (nameEl ? nameEl.text() : "") + "";

    var coverEl = doc.select(".thumb-cover img").first();
    var cover = "";
    if (coverEl) {
        cover = (coverEl.attr("data-src") || coverEl.attr("src") || "") + "";
        if (cover.startsWith("//")) cover = "https:" + cover;
        if (cover && !cover.startsWith("http")) cover = BASE_URL + cover;
        try {
            var urlObj = new URL(cover);
            urlObj.pathname = urlObj.pathname
                .split("/")
                .map(p => encodeURIComponent(p))
                .join("/");
            cover = urlObj.toString();
        } catch (e) {
            cover = encodeURI(cover);
        }
    }

    var author = "";
    doc.select("div.grid-cols-1 > div").forEach(function (row) {
        var label = row.select("div").first();
        if (!label) return;
        var labelText = (label.text() + "").trim();
        if (labelText === "Tác giả" || labelText === "Tác giả:") {
            var valEl = row.select("div").last();
            author = (valEl ? valEl.text() : "") + "";
        }
    });
    author = author.trim();

    var status = "";
    doc.select("div.bg-filter-box").forEach(function (box) {
        var label = box.select("div").first();
        if (!label) return;
        var labelText = (label.text() + "").trim();
        if (labelText === "Trạng thái" || labelText === "Trạng thái:") {
            var valEl = box.select("div").last();
            status = (valEl ? valEl.text() : "") + "";
        }
    });
    status = status.trim();
    var ongoing = status.indexOf("Hoàn") === -1
        && status.indexOf("Completed") === -1
        && status.indexOf("Full") === -1
        && status.indexOf("完结") === -1
        && status.indexOf("Đã hoàn") === -1
        && status.indexOf("Đã full") === -1;

    var descEl = doc.select("p.comic-content").first();
    var description = (descEl ? descEl.html() : "") + "";

    var genres = [];
    doc.select("a[role=\"button\"][href*=\"/the-loai/\"]").forEach(function (el) {
        var gTitle = el.text().trim() + "";
        var gHref = (el.attr("href") || "") + "";
        if (!gTitle || !gHref) return;
        if (!gHref.startsWith("http")) gHref = BASE_URL + gHref;
        genres.push({ title: gTitle, input: gHref + "?page={{page}}", script: "gen.js" });
    });

    var suggests = [];
    suggests.push({ title: "Liên quan: " + author, input: author, script: "search.js" });

    return Response.success({
        name: name,
        cover: cover,
        host: BASE_URL,
        author: author,
        description: description,
        ongoing: ongoing,
        genres: genres,
        suggests: suggests
    });
}