// track.js — Xử lý URL stream từ chap.js thành luồng cho player
// Contract: execute(url) → { data*, type*, headers?:Object, host?:string, timeSkip?:[] }
// Stream javsub là HLS TS chuẩn (.m3u8); segment yêu cầu Referer = origin play (v-cast.top / e.streamforester.name)
// LƯU Ý: KHÔNG normalize domain — url là master.m3u8 trên server stream khác.
function execute(url) {
    var lower = (url || "").toLowerCase();
    var isDirect = lower.indexOf(".m3u8") !== -1
        || lower.indexOf(".mp4") !== -1
        || lower.indexOf(".m3u9") !== -1;

    var UA = "Mozilla/5.0 (Linux; Android 13; SM-F741N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";

    // Referer: origin của chính stream (nơi segment nằm sau play page)
    var ref = "https://v-cast.top/";
    var m = url.match(/^(https?:\/\/[^\/]+)/);
    if (m) ref = m[1] + "/";

    return Response.success({
        data: url,
        type: isDirect ? "native" : "auto",
        headers: {
            "User-Agent": UA,
            "Referer": ref
        },
        host: m ? m[1] : "https://v-cast.top",
        timeSkip: []
    });
}
