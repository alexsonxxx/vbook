// toc.js — Mục lục tập phim
// Contract: execute(url) → [{ name*, url*, host? }]
// Thật: trang /phim/<slug> chính là trang xem (player jwplayer + a.server).
//       Mỗi phim JAV là một video duy nhất → trả về 1 entry.
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();

    var nameEl = doc.select("h1.header-title a").first();
    if (!nameEl) nameEl = doc.select("h1").first();
    var name = ((nameEl ? nameEl.text() : "") + "").trim() || "Xem phim";

    return Response.success([
        { name: name, url: url, host: BASE_URL }
    ]);
}
