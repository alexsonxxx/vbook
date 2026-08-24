// chap.js — Lấy stream cho trang video
// Site có 2 thế hệ trang chi tiết (đã inspect thật):
//  A) /bai-viet/{slug}/: <video class="app-plyr-player" data-src="*.m3u8">
//  B) /{slug}/: div.movieLoader[data-movie][data-type] + nút .video2-btn;
//     site POST /get.video.php (movie_id&type&index) -> iframe emb.cd-vs.com/embed/{uuid}
//     -> GET https://emb.cd-vs.com/api/get-video?id={uuid} -> JSON {url} (stream cuối)
// Contract: execute(url) → [{ title*, data* }]
load("config.js");

function execute(url) {
    url = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);

    var res = fetch(url, { headers: { "User-Agent": UA }, timeout: 25000 });
    if (!res.ok) return Response.error("Cannot load: " + res.status);

    var doc = res.html();
    var tracks = [];

    // A) Player plyr với m3u8 trực tiếp
    doc.select("video.app-plyr-player").forEach(function (v) {
        var src = (v.attr("data-src") || v.attr("src") || "") + "";
        if (!src) return;
        if (src.indexOf("//") === 0) src = "https:" + src;
        tracks.push({
            title: tracks.length === 0 ? "Full" : "Phần " + (tracks.length + 1),
            data: src
        });
    });

    if (tracks.length > 0) return Response.success(tracks);

    // B) movieLoader: mỗi .video2-btn là 1 server
    var buttons = doc.select(".movieLoader-server .video2-btn");
    var hasButtons = buttons.size() > 0;

    function resolveServer(movieId, type, label) {
        var endpoint = String(type) === "10" ? BASE_URL + "/get.xvideo.php" : BASE_URL + "/get.video.php";
        var r = fetch(endpoint, {
            method: "POST",
            headers: {
                "User-Agent": UA,
                "Content-Type": "application/x-www-form-urlencoded",
                "Referer": url,
                "X-Requested-With": "XMLHttpRequest"
            },
            body: "movie_id=" + encodeURIComponent(movieId) + "&type=" + encodeURIComponent(type) + "&index=1",
            timeout: 20000
        });
        if (!r.ok) return null;

        var html = r.text() + "";
        // iframe trả về dạng <iframe id="playerV4_1" src="https://emb.cd-vs.com/embed/{uuid}">
        var m = html.match(/iframe[^>]*src=["']([^"']+)["']/i);
        var frameSrc = m ? m[1] : "";
        if (!frameSrc) {
            // một số response có thể là link chơi trực tiếp
            var dm = html.match(/https?:\/\/[^\s"'<>]+\.(?:m3u8|mp4)[^\s"'<>]*/);
            return dm ? dm[0] : null;
        }
        if (frameSrc.indexOf("//") === 0) frameSrc = "https:" + frameSrc;

        // Embed của emb.cd-vs.com: gọi API nội bộ lấy stream thật
        var um = frameSrc.match(/\/embed\/([a-f0-9-]+)/i);
        if (um) {
            var apiRes = fetch("https://emb.cd-vs.com/api/get-video?id=" + um[1], {
                headers: { "User-Agent": UA, "Referer": frameSrc },
                timeout: 20000
            });
            if (apiRes.ok) {
                try {
                    var j = apiRes.json();
                    var u = (j && j.url ? j.url + "" : "");
                    // URL blogger.com/video.g chỉ phát được trong browser context
                    // (fetch trực tiếp trả HTML) -> dùng embed page để WebView tự bắt
                    if (u && u.indexOf("blogger.com") === -1) return u;
                } catch (e) {}
            }
        }

        // Fallback: trả chính iframe để app dùng WebView tự bắt stream
        return frameSrc;
    }

    if (hasButtons) {
        buttons.forEach(function (btn) {
            var movieId = (btn.attr("data-video") || "") + "";
            var type = (btn.attr("data-type") || "") + "";
            if (!movieId) return;
            var label = (btn.text() + "").trim() || "Server";
            var stream = resolveServer(movieId, type, label);
            if (!stream) return;
            tracks.push({ title: label, data: stream });
        });
        // Ưu tiên track stream trực tiếp (m3u8/mp4) lên đầu danh sách server
        tracks.sort(function (a, b) {
            var da = (a.data + "").indexOf(".m3u8") >= 0 || (a.data + "").indexOf(".mp4") >= 0 ? 0 : 1;
            var db = (b.data + "").indexOf(".m3u8") >= 0 || (b.data + "").indexOf(".mp4") >= 0 ? 0 : 1;
            return da - db;
        });
    } else {
        // Không có nhóm server: dùng trực tiếp .movieLoader
        doc.select("div.movieLoader").forEach(function (el) {
            var movieId = (el.attr("data-movie") || "") + "";
            var type = (el.attr("data-type") || "") + "";
            if (!movieId) return;
            var stream = resolveServer(movieId, type, "Full");
            if (!stream) return;
            tracks.push({
                title: tracks.length === 0 ? "Full" : "Phần " + (tracks.length + 1),
                data: stream
            });
        });
    }

    if (tracks.length === 0) return Response.error("No stream found");
    return Response.success(tracks);
}
