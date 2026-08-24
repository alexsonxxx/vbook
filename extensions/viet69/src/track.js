// track.js — Chọn kiểu phát cho stream từ chap.js
// Contract: execute(url) → { data*, type*, headers?:Object, host?:string, timeSkip? }
// Đã verify từ device:
//  - CDN cd-vs/vscd CHẶN thiếu Referer (403) -> native phải kèm Referer + UA
//  - blogger.com/video.g trả HTML chứ không phải video -> KHÔNG dùng native,
//    chap.js sẽ trả URL embed thay thế và ở đây chuyển sang auto (WebView tự bắt)
load("config.js");

function execute(url) {
    // LƯU Ý: url đây là stream/embed URL ngoài, KHÔNG normalize về BASE_URL
    var lower = (url || "").toLowerCase();

    if (lower.indexOf(".m3u8") !== -1 || lower.indexOf(".m3u9") !== -1 || lower.indexOf(".mp4") !== -1) {
        return Response.success({
            data: url,
            type: "native",
            headers: {
                "User-Agent": UA,
                "Referer": BASE_URL + "/"
            },
            host: BASE_URL,
            timeSkip: []
        });
    }

    return Response.success({
        data: url,
        type: "auto",
        headers: {
            "User-Agent": UA,
            "Referer": "https://emb.cd-vs.com/"
        },
        host: BASE_URL,
        timeSkip: []
    });
}
