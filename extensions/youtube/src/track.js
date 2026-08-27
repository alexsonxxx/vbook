load('config.js');

// track.js — resolve an episode (a watch URL) to a playable stream.
// Strategy (verified 2026-08):
//   1. VISIONOS / ANDROID_VR innertube clients return fully-signed googlevideo
//      URLs (no nsig/PO deciphering) — they require the page's
//      `X-Goog-Visitor-Id`, so the watch page is fetched first. The HLS master
//      manifest is preferred: standard m3u8 carries its own audio rendition
//      (the app muxes it natively) with muxed variants up to 2160p. The
//      `youtube_quality` config locks a specific variant when set.
//   2. ANDROID client (20.09.36 / 20.03.32) returns a single progressive
//      360p mp4 without a visitor id — no-extra-fetch fallback.
//   3. webview as the last resort for login/region-blocked videos.
var API_KEY = "";
var YT_REFERER = "https://www.youtube.com/";
var MAX_VIDEO_HEIGHT = 1080;

var VISIONOS = {
    clientName: "VISIONOS",
    clientVersion: "1.02",
    clientNum: "101",
    ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15",
    context: { clientName: "VISIONOS", clientVersion: "1.02", deviceMake: "Apple", deviceModel: "RealityDevice17,1", osName: "visionOS", osVersion: "26.5.23O471" }
};

var ANDROID_VR = {
    clientName: "ANDROID_VR",
    clientVersion: "1.65.10",
    clientNum: "28",
    ua: "com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
    context: { clientName: "ANDROID_VR", clientVersion: "1.65.10", deviceMake: "Oculus", deviceModel: "Quest 3", androidSdkVersion: 32, osName: "Android", osVersion: "12L" }
};

var ANDROID_FALLBACKS = [
    { clientVersion: "20.09.36", clientNum: "3", ua: "com.google.android.youtube/20.09.36 (Linux; U; Android 11) gzip" },
    { clientVersion: "20.03.32", clientNum: "3", ua: "com.google.android.youtube/20.03.32 (Linux; U; Android 11) gzip" }
];

function videoIdOf(url) {
    let m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return "";
}

function trimText(value) {
    if (value == null) return "";
    return String(value).replace(/^\s+|\s+$/g, "");
}

function isH264Format(f) {
    return (f.mimeType || "").indexOf("avc1") !== -1;
}

// visitorData is embedded in every YouTube page (ytcfg / ytInitialData).
function fetchVisitorData(pageUrl) {
    let response = fetch(pageUrl, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
    if (!response.ok) return "";
    let html = response.text();
    let m = html.match(/"visitorData":"([^"]+)/);
    return m ? m[1] : "";
}

function postPlayer(videoId, client, visitor) {
    let context = {};
    let key;
    for (key in client.context) {
        if (Object.prototype.hasOwnProperty.call(client.context, key)) context[key] = client.context[key];
    }
    context.hl = "vi";
    context.gl = "VN";
    context.utcOffsetMinutes = 420;

    let headers = {
        "Content-Type": "application/json",
        "X-YouTube-Client-Name": client.clientNum,
        "X-YouTube-Client-Version": client.clientVersion,
        "Origin": "https://www.youtube.com",
        "Accept-Language": "vi,en;q=0.9,en-US;q=0.8",
        "User-Agent": client.ua
    };
    if (visitor) headers["X-Goog-Visitor-Id"] = visitor;

    let response = fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false&key=" + API_KEY, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ videoId: videoId, contentCheckOk: true, racyCheckOk: true, context: { client: context } })
    });
    if (!response.ok) return null;
    try {
        return response.json();
    } catch (error) {
        return null;
    }
}

// Best single mp4 video ≤ MAX_VIDEO_HEIGHT (H.264 preferred on ties).
function pickBestVideo(formats) {
    if (!formats) return null;
    let best = null;
    for (let i = 0; i < formats.length; i++) {
        let f = formats[i];
        if (!f || !f.url) continue;
        let mime = trimText(f.mimeType || "");
        if (mime.indexOf("video/mp4") !== 0) continue;
        let h = parseInt(f.height, 10) || 0;
        if (h > MAX_VIDEO_HEIGHT) continue;
        if (!best || h > best.height || (h === best.height && isH264Format(f) && !isH264Format(best.format))) {
            best = { height: h, format: f };
        }
    }
    return best ? best.format : null;
}

// Best mp4 audio — itag 140 preferred (original soundtrack), else highest bitrate.
function pickBestAudio(formats) {
    if (!formats) return null;
    let best = null;
    for (let i = 0; i < formats.length; i++) {
        let f = formats[i];
        if (!f || !f.url) continue;
        let mime = trimText(f.mimeType || "");
        if (mime.indexOf("audio/mp4") !== 0) continue;
        if (Number(f.itag) === 140) return f;
        if (!best || (Number(f.bitrate) || 0) > (Number(best.bitrate) || 0)) best = f;
    }
    return best;
}

// Caption names may be {simpleText}, {runs:[{text}]} or a plain string.
function getTextValue(value) {
    if (value == null) return "";
    if (typeof value === "string") return trimText(value);
    if (value.simpleText) return trimText(value.simpleText);
    if (value.runs && value.runs.length) {
        let out = "";
        for (let i = 0; i < value.runs.length; i++) out += trimText(value.runs[i].text);
        return out;
    }
    return "";
}

function isVietnameseLang(text) {
    return /^vi(\b|-|_)?/i.test(trimText(text));
}

// Quality preference from the extension config. Only two sound-safe modes
// exist (see config.js): auto (HLS master) and the 360p progressive file.
function getConfiguredQuality() {
    let value = "";
    try {
        if (typeof youtube_quality !== "undefined") value = trimText(youtube_quality);
    } catch (error) {}
    return value.indexOf("360") !== -1 ? 360 : 0;
}

// VTT subtitle list from the player response, Vietnamese first, max 12.
function buildSubtitleTracks(playerJson) {
    let renderer = playerJson && playerJson.captions && playerJson.captions.playerCaptionsTracklistRenderer
        ? playerJson.captions.playerCaptionsTracklistRenderer
        : null;
    let tracks = renderer && renderer.captionTracks ? renderer.captionTracks : [];
    let out = [];
    let seen = {};
    for (let i = 0; i < tracks.length; i++) {
        let item = tracks[i] || {};
        let url = trimText(item.baseUrl || "");
        if (url === "") continue;
        url += (url.indexOf("?") === -1 ? "?" : "&") + "fmt=vtt";
        if (seen[url]) continue;
        seen[url] = true;
        let lang = trimText(item.languageCode || "");
        let name = getTextValue(item.name) || lang || "Subtitle";
        out.push({
            title: name,
            label: name,
            language: lang,
            lang: lang,
            data: url,
            url: url,
            type: "vtt",
            selected: isVietnameseLang(lang) || isVietnameseLang(name),
            source: "youtube.captionTracks"
        });
    }
    out.sort(function(a, b) {
        function priority(item) {
            if (isVietnameseLang(item.language) || isVietnameseLang(item.title)) return 0;
            if (/^en(\b|-|_)/i.test(item.language) || /english|original|gốc/i.test(item.title)) return 1;
            return 2;
        }
        let ap = priority(a);
        let bp = priority(b);
        if (ap !== bp) return ap - bp;
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return 0;
    });
    return out.slice(0, 12);
}

// ANDROID fallback: single progressive stream (audio+video), no visitor needed.
function resolveAndroidProgressive(videoId) {
    for (let i = 0; i < ANDROID_FALLBACKS.length; i++) {
        let a = ANDROID_FALLBACKS[i];
        let client = {
            clientName: "ANDROID",
            clientVersion: a.clientVersion,
            clientNum: a.clientNum,
            ua: a.ua,
            context: { clientName: "ANDROID", clientVersion: a.clientVersion, androidSdkVersion: 30 }
        };
        let data = postPlayer(videoId, client, "");
        if (!data || !data.streamingData) continue;
        let sd = data.streamingData;
        let subs = buildSubtitleTracks(data);
        if (sd.hlsManifestUrl) return { url: sd.hlsManifestUrl, mime: "application/x-mpegURL", ua: a.ua, subtitles: subs };
        let formats = sd.formats || [];
        let best = null;
        for (let j = 0; j < formats.length; j++) {
            let u = formats[j].url || "";
            if (u.indexOf("http") !== 0) continue;
            let h = parseInt(formats[j].height, 10) || 0;
            if (!best || h > best.height) best = { url: u, height: h };
        }
        if (best) return { url: best.url, mime: "video/mp4", ua: a.ua, subtitles: subs };
    }
    return null;
}

function execute(data) {
    data = data || "";

    // Payload from chap.js, "Tiết kiệm (360p)": muxed progressive mp4 via
    // the ANDROID client (no visitor round-trip needed).
    if (data.indexOf("{") === 0) {
        let payload = null;
        try {
            payload = JSON.parse(data);
        } catch (error) {
            payload = null;
        }
        if (payload && payload.videoId && payload.q === "360") {
            try {
                let prog = resolveAndroidProgressive(payload.videoId);
                if (prog) {
                    let out = {
                        type: "native",
                        data: prog.url,
                        mimeType: prog.mime,
                        headers: { "User-Agent": prog.ua, "Referer": YT_REFERER },
                        timeSkip: []
                    };
                    if (prog.subtitles && prog.subtitles.length) {
                        out.subtitles = prog.subtitles;
                        out.subtitleTracks = prog.subtitles;
                    }
                    return Response.success(out);
                }
            } catch (error) {
                // fall through to full resolution below
            }
        }
        // "Chỉ nghe (Audio)": best audio-only stream (itag 140 preferred).
        if (payload && payload.q === "audio" && payload.videoId) {
            try {
                let pageUrl = BASE_URL + "/watch?v=" + payload.videoId;
                let visitor = fetchVisitorData(pageUrl);
                if (visitor !== "") {
                    let player = postPlayer(payload.videoId, VISIONOS, visitor);
                    let audio = player ? pickBestAudio(player.streamingData ? player.streamingData.adaptiveFormats : null) : null;
                    if (audio && audio.url) {
                        return Response.success({
                            type: "native",
                            data: audio.url,
                            mimeType: trimText(audio.mimeType || "audio/mp4"),
                            headers: { "User-Agent": VISIONOS.ua, "Referer": YT_REFERER },
                            timeSkip: []
                        });
                    }
                }
            } catch (error) {
                // fall through to full resolution below
            }
        }
        // "Tự động": passthrough the HLS master fetched on this device.
        if (payload && payload.stream && /^(https?:\/\/|data:application\/)/i.test(payload.stream)) {
            try {
                let out = {
                    type: "native",
                    data: payload.stream,
                    mimeType: "application/x-mpegURL",
                    headers: { "User-Agent": VISIONOS.ua, "Referer": YT_REFERER },
                    timeSkip: []
                };
                if (payload.subs && payload.subs.length) {
                    out.subtitles = payload.subs;
                    out.subtitleTracks = payload.subs;
                }
                return Response.success(out);
            } catch (error) {
                // fall through to full resolution below
            }
        }
    }

    // Already a direct stream (m3u8/mp4/googlevideo passed straight through).
    if (data.indexOf(".m3u8") !== -1 || data.indexOf(".mp4") !== -1 || data.indexOf("googlevideo.com") !== -1) {
        return Response.success({
            type: "native",
            data: data,
            headers: { "User-Agent": UserAgent.chrome(), "Referer": YT_REFERER }
        });
    }

    let videoId = videoIdOf(data);
    if (videoId === "") return Response.error("URL không hợp lệ");

    // Config "Tiết kiệm (360p)": go straight to the muxed progressive file.
    if (getConfiguredQuality() === 360) {
        let prog0 = resolveAndroidProgressive(videoId);
        if (prog0) {
            let out = {
                type: "native",
                data: prog0.url,
                mimeType: prog0.mime,
                headers: { "User-Agent": prog0.ua, "Referer": YT_REFERER },
                timeSkip: []
            };
            if (prog0.subtitles && prog0.subtitles.length) {
                out.subtitles = prog0.subtitles;
                out.subtitleTracks = prog0.subtitles;
            }
            return Response.success(out);
        }
    }

    // 1) VISIONOS -> ANDROID_VR: high quality adaptive video + separate audio.
    let visitor = fetchVisitorData(data);
    if (visitor !== "") {
        let clients = [VISIONOS, ANDROID_VR];
        for (let i = 0; i < clients.length; i++) {
            let player = postPlayer(videoId, clients[i], visitor);
            if (!player || !player.streamingData) continue;
            let sd = player.streamingData;
            let subtitles = buildSubtitleTracks(player);
            // HLS first: standard m3u8 carries its own audio rendition
            // (the player muxes it natively) with variants up to 2160p.
            // Separate mp4 + audios[] only as a last-resort within this client.
            if (sd.hlsManifestUrl) {
                let streamUrl = sd.hlsManifestUrl;
                let hlsOut = {
                    type: "native",
                    data: streamUrl,
                    mimeType: "application/x-mpegURL",
                    headers: { "User-Agent": clients[i].ua, "Referer": YT_REFERER },
                    timeSkip: []
                };
                if (subtitles.length) {
                    hlsOut.subtitles = subtitles;
                    hlsOut.subtitleTracks = subtitles;
                }
                return Response.success(hlsOut);
            }
            let video = pickBestVideo(sd.adaptiveFormats);
            if (!video) continue;
            let audio = pickBestAudio(sd.adaptiveFormats);
            let out = {
                type: "native",
                data: video.url,
                mimeType: trimText(video.mimeType || "video/mp4"),
                headers: { "User-Agent": clients[i].ua, "Referer": YT_REFERER },
                timeSkip: []
            };
            if (audio) {
                out.audio = audio.url;
                out.audios = [{
                    data: audio.url,
                    type: trimText(audio.mimeType || "audio/mp4"),
                    label: "Audio",
                    language: ""
                }];
            }
            if (subtitles.length) {
                out.subtitles = subtitles;
                out.subtitleTracks = subtitles;
            }
            return Response.success(out);
        }
    }

    // 2) ANDROID fallback: 360p progressive (audio+video in one file).
    let prog = resolveAndroidProgressive(videoId);
    if (prog) {
        let out = {
            type: "native",
            data: prog.url,
            mimeType: prog.mime,
            headers: { "User-Agent": prog.ua, "Referer": YT_REFERER },
            timeSkip: []
        };
        if (prog.subtitles && prog.subtitles.length) {
            out.subtitles = prog.subtitles;
            out.subtitleTracks = prog.subtitles;
        }
        return Response.success(out);
    }

    // 3) Last resort for login/region-blocked videos.
    return Response.success({
        type: "webview",
        data: data,
        headers: { "User-Agent": UserAgent.chrome(), "Referer": YT_REFERER }
    });
}
