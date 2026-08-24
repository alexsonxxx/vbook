// track.js — Xử lý data từ chap.js thành luồng cho player
// Contract: execute(url) → { data*, type*, headers?:Object, host?:string, timeSkip?:[{startTime, endTime}] }
// LƯU Ý: url vào là master.m3u8 của CDN bên ngoài (v8.streamvsmov.com) →
// KHÔNG được rewrite domain về BASE_URL, giữ nguyên URL gốc.
load("config.js");

function execute(url) {
    // Link m3u8/mp4 trực tiếp → native player
    if (url.indexOf(".mp4") !== -1 || url.indexOf(".m3u8") !== -1 || url.indexOf(".m3u9") !== -1) {
        return Response.success({
            data: url,
            type: "native",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Referer": "https://v8.streamvsmov.com/"
            },
            host: BASE_URL,
            timeSkip: []
        });
    }

    // Link nhúng → WebView tự bắt stream
    return Response.success({
        data: url,
        type: "auto",
        headers: {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        },
        host: BASE_URL,
        timeSkip: []
    });
}