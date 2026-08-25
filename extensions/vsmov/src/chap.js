// chap.js — Lấy danh sách server/phân giải stream cho 1 tập video
// Contract: execute(url) → [{ title*, data* }]
// url vào: BASE_URL + "/phim/{slug}/{epSlug}" (từ toc.js)
// → gọi API detail, tìm tập theo epSlug, build URL master.m3u8 từ link_embed
// → fetch embed page để lấy phụ đề VTT (playerOptions.subtitles) → trả payload JSON cho track.js
load("config.js");

/** Lấy origin (scheme://host) từ 1 URL */
function getOrigin(url) {
    var m = (url + "").match(/^(https?:\/\/[^\/?#]+)/i);
    return m ? m[1] : "";
}

/** Tách danh sách phụ đề VTT từ embed page (playerOptions.subtitles) */
function buildSubtitleTracks(embedHtml, embedOrigin) {
    var subs = [];
    if (!embedHtml) return subs;
    var m = embedHtml.match(/subtitles:\s*(\[[^\]]*\])/);
    if (!m) return subs;
    var arr = null;
    try {
        arr = JSON.parse(m[1]);
    } catch (e) {
        return subs;
    }
    if (!arr) return subs;
    for (var i = 0; i < arr.length; i++) {
        var it = arr[i] || {};
        var rel = (it.url || "") + "";
        if (!rel) continue;
        var abs = rel;
        if (abs.indexOf("http") !== 0) {
            abs = embedOrigin + (rel.charAt(0) === "/" ? rel : "/" + rel);
        }
        var code = (it.code || "") + "";
        // Làm sạch title: bỏ timestamp thừa trong tên file (vd "vie 1784386265110 4dt5k8")
        var label = code ? code : ((it.name || "Subtitle") + "");
        if (code === "vie" || code === "vi" || code === "vi-VN") label = "Vietsub";
        else if (code === "eng" || code === "en") label = "English";
        else if (code === "chi" || code === "zh") label = "Chinese";
        else if (code === "tha" || code === "th") label = "Thailand";
        else if (code === "kor" || code === "ko") label = "Korean";
        else if (code === "jap" || code === "ja") label = "Japanese";
        else if (code === "fre" || code === "fr") label = "French";
        subs.push({
            title: label,
            label: label,
            language: code,
            lang: code,
            data: abs,
            url: abs,
            type: "vtt",
            selected: code === "vie" || code === "vi" || code === "vi-VN"
        });
    }
    return subs;
}

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

            // Fetch embed page để lấy phụ đề VTT (nếu có)
            var subtitles = [];
            try {
                var embedRes = fetch(embed, { timeout: 15000 });
                if (embedRes.ok) {
                    var embedOrigin = em ? em[1] : getOrigin(embed);
                    subtitles = buildSubtitleTracks(embedRes.text() + "", embedOrigin);
                }
            } catch (e) {}

            var data = streamUrl;
            if (subtitles.length > 0) {
                data = JSON.stringify({
                    url: streamUrl,
                    subtitles: subtitles,
                    subtitleTracks: subtitles
                });
            }

            tracks.push({
                title: title,
                data: data
            });
        });
    });

    if (tracks.length === 0) return Response.error("Không tìm thấy stream cho tập này");
    return Response.success(tracks);
}
