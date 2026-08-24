// chap.js — Các server stream của phim
// Contract: execute(url) → [{ title*, data* }]
// Thật: .user-action a.server[data-id][data-link][data-type="m3u8"]
//       data-link = /storage/m3u8/<slug>/index.m3u8 (master HLS, đã probe 200 OK)
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var tracks = [];
    var seen = {};

    doc.select("a.server").forEach(function (el) {
        var src = (el.attr("data-link") || "") + "";
        if (!src) return;
        if (src.indexOf("//") === 0) src = "https:" + src;
        else if (src.indexOf("http") !== 0) src = BASE_URL + src;
        if (seen[src]) return;
        seen[src] = true;

        var t = ((el.text() || "") + "").trim();
        tracks.push({
            title: "Server " + (t ? t : String(tracks.length + 1)),
            data: src
        });
    });

    if (tracks.length === 0) return Response.error("No stream found");
    return Response.success(tracks);
}
