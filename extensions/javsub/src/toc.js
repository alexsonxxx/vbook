// toc.js — Danh sách tập: mỗi phim là 1 entry duy nhất
// Contract: execute(url) → [{ name*, url*, host? }]
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
    if (url.slice(-1) !== "/") url = url + "/";

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var nameEl = doc.select("h1.heading__title").first();
    var name = ((nameEl ? nameEl.text() : "") + "").trim() || "Xem phim";

    return Response.success([
        { name: name, url: url, host: BASE_URL }
    ]);
}
