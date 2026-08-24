// chap.js — Lấy danh sách server/phân giải stream cho 1 tập video
// Contract: execute(url) → [{ title*, data* }]
// url vào: BASE_URL + "/phim/{slug}/{epSlug}" (từ toc.js)
// → gọi API detail, tìm tập theo epSlug, build URL master.m3u8 từ link_embed
load("config.js");

function execute(url) {
    var m = (url + "").match(/\/phim\/([^\/\?#]+)(?:\/([^\/\?#]+))?/);
    if (!m) return Response.error("Không phân tích được URL: " + url);
    var slug = m[1];
    var epSlug = m[2] || null;

    var j = fetchJson(API_BASE + "/phim/" + slug);
    if (!j || !j.episodes) return Response.error("API không trả dữ liệu: " + slug);

    var tracks = [];

    j.episodes.forEach(function (server) {
        (server.server_data || []).forEach(function (ep) {
            // Nếu URL chỉ định tập thì lọc đúng tập; nếu không (phim lẻ) lấy tất cả
            if (epSlug && (ep.slug || "") !== epSlug) return;

            var embed = (ep.link_embed || "") + "";
            if (!embed) return;

            // link_embed: https://v8.streamvsmov.com/video/{hash}
            // master.m3u8: https://v8.streamvsmov.com/stream/{hash}/master.m3u8
            var streamUrl = embed;
            var em = embed.match(/^(https?:\/\/[^\/]+)\/video\/([a-zA-Z0-9-]+)\/?$/);
            if (em) {
                streamUrl = em[1] + "/stream/" + em[2] + "/master.m3u8";
            }

            var title = "m3u8";
            if (j.episodes.length > 1 && server.server_name) {
                title = (server.server_name + "").trim() + " · m3u8";
            }

            tracks.push({
                title: title,
                data: streamUrl
            });
        });
    });

    if (tracks.length === 0) return Response.error("Không tìm thấy stream cho tập này");
    return Response.success(tracks);
}
