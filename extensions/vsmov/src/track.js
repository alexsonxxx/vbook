// track.js — Xử lý data từ chap.js thành luồng cho player
// Contract: execute(url) → { data*, type*, headers?:Object, host?:string, timeSkip?:[{startTime, endTime}], subtitles?:[{...}], subtitleTracks?:[{...}] }
// LƯU Ý: data từ chap.js có thể là:
//   - URL m3u8/mp4 trực tiếp của CDN bên ngoài (v8.streamvsmov.com) → KHÔNG rewrite domain
//   - JSON string {url, subtitles:[...]} → parse để lấy url + gắn phụ đề VTT vào response
load("config.js");

/** Parse input: nếu là JSON string (payload từ chap.js) thì lấy {url, subtitles}; ngược lại xem như URL thường */
function parseTrackInput(input) {
    var s = (input || "") + "";
    if (s.charAt(0) === "{" && s.charAt(s.length - 1) === "}") {
        try {
            var obj = JSON.parse(s);
            if (obj && typeof obj === "object" && obj.url) return obj;
        } catch (e) {}
    }
    return { url: s };
}

function execute(url) {
    var payload = parseTrackInput(url);
    var data = (payload.url || "") + "";
    if (!data) return Response.error("URL track không hợp lệ");

    var response = null;

    // Link m3u8/mp4 trực tiếp → native player
    if (data.indexOf(".mp4") !== -1 || data.indexOf(".m3u8") !== -1 || data.indexOf(".m3u9") !== -1) {
        response = {
            data: data,
            type: "native",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "Referer": "https://v8.streamvsmov.com/"
            },
            host: BASE_URL,
            timeSkip: []
        };
    } else {
        // Link nhúng → WebView tự bắt stream
        response = {
            data: data,
            type: "auto",
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
            },
            host: BASE_URL,
            timeSkip: []
        };
    }

    // Gắn phụ đề VTT nếu có (giống contract của youtube extension)
    if (payload.subtitles && payload.subtitles.length) {
        response.subtitles = payload.subtitles;
        response.subtitleTracks = payload.subtitles;
    } else if (payload.subtitleTracks && payload.subtitleTracks.length) {
        response.subtitles = payload.subtitleTracks;
        response.subtitleTracks = payload.subtitleTracks;
    }

    return Response.success(response);
}
