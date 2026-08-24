// chap.js — Lấy danh sách server/stream cho phim
// Contract: execute(url) → [{ title*, data* }]
// Thật:
//  - Trang detail chứa .player__cdn[data-source] (Server 1/2) = URL /videos/<id>/play
//  - GET trang play → window.videoData.sources[0].file = "/videos/<id>/master.m3u8"
//  - stream HLS TS chuẩn, segment yêu cầu Referer = origin play
function execute(url) {
    load('config.js');
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var UA = "Mozilla/5.0 (Linux; Android 13; SM-F741N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

    var res = fetch(url);
    if (!res.ok) return Response.error("Cannot load: " + res.status);
    var doc = res.html();

    var servers = [];
    doc.select(".player__cdn").forEach(function (btn) {
        var src = (btn.attr("data-source") || "") + "";
        var title = (btn.text() || "").trim() + "";
        if (!src) return;
        if (src.indexOf("//") === 0) src = "https:" + src;
        servers.push({ title: title || "Server " + (servers.length + 1), url: src });
    });
    if (servers.length === 0) return Response.error("No server found");

    function extractMaster(html, origin) {
        var i = html.indexOf("videoData");
        if (i < 0) return null;
        var a = html.indexOf("{", i);
        if (a < 0) return null;
        // tìm file trong sources
        var fm = html.substring(a).match(/"file"\s*:\s*"([^"]+)"/);
        if (!fm) return null;
        var f = fm[1];
        if (f.indexOf("//") === 0) return "https:" + f;
        if (f.indexOf("http") === 0) return f;
        return origin + f;
    }

    var tracks = [];
    var seenData = {};
    for (var j = 0; j < servers.length; j++) {
        var s = servers[j];
        var m = s.url.match(/^(https?:\/\/[^\/]+)/);
        var origin = m ? m[1] : BASE_URL;

        var pr = fetch(s.url, {
            headers: { "User-Agent": UA, "Referer": url }
        });
        if (!pr.ok) continue;
        var master = extractMaster((pr.text() || "") + "", origin);
        if (!master || seenData[master]) continue;
        seenData[master] = true;
        tracks.push({
            title: s.title,
            data: master
        });
    }

    if (tracks.length === 0) return Response.error("No stream found");
    return Response.success(tracks);
}
