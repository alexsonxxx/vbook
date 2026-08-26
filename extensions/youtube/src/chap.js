load('config.js');

// chap.js — playback choices shown right at the player screen. Only two
// sound-safe modes exist in this app (see the note at the bottom of
// config.js): the full HLS master (adaptive, best quality) and the muxed
// progressive mp4 (itag 18, 360p). Intermediate "locked" HLS variants are
// video-only on YouTube and would play silently.
// Payloads consumed by track.js:
//   { q:"auto", stream:<master url>, subs:[...] }
//   { q:"360",  videoId, subs:[...] }   -> track resolves itag 18 itself
//   { q:"audio", videoId }              -> best audio-only stream (music mode)
// On any failure we degrade to the single legacy item (plain watch URL).

var CHAP_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
var CHAP_VISIONOS_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15";

function trimText(value) {
    if (value == null) return "";
    return String(value).replace(/^\s+|\s+$/g, "");
}

function videoIdOf(url) {
    let m = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    m = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return "";
}

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

function fetchVisitorData(pageUrl) {
    let response = fetch(pageUrl, { headers: { "User-Agent": UserAgent.chrome(), "Accept-Language": "en-US,en;q=0.9" } });
    if (!response.ok) return "";
    let m = response.text().match(/"visitorData":"([^"]+)/);
    return m ? m[1] : "";
}

function postVisionos(videoId, visitor) {
    let response = fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false&key=" + CHAP_API_KEY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-YouTube-Client-Name": "101",
            "X-YouTube-Client-Version": "1.02",
            "Origin": "https://www.youtube.com",
            "X-Goog-Visitor-Id": visitor,
            "Accept-Language": "vi,en;q=0.9,en-US;q=0.8",
            "User-Agent": CHAP_VISIONOS_UA
        },
        body: JSON.stringify({
            videoId: videoId,
            contentCheckOk: true,
            racyCheckOk: true,
            context: { client: { clientName: "VISIONOS", clientVersion: "1.02", deviceMake: "Apple", deviceModel: "RealityDevice17,1", osName: "visionOS", osVersion: "26.5.23O471", hl: "vi", gl: "VN", utcOffsetMinutes: 420 } }
        })
    });
    if (!response.ok) return null;
    try {
        return response.json();
    } catch (error) {
        return null;
    }
}

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

function execute(url) {
    url = url || "";

    function fallback() {
        return Response.success([{ title: "YouTube", data: url }]);
    }

    let videoId = videoIdOf(url);
    if (videoId === "") return fallback();
    let visitor = fetchVisitorData(url);
    if (visitor === "") return fallback();
    let player = postVisionos(videoId, visitor);
    if (!player || !player.streamingData || !player.streamingData.hlsManifestUrl) return fallback();

    let master = player.streamingData.hlsManifestUrl;
    let subs = buildSubtitleTracks(player);

    return Response.success([
        { title: "Tự động", data: JSON.stringify({ q: "auto", stream: master, subs: subs }) },
        { title: "Tiết kiệm (360p)", data: JSON.stringify({ q: "360", videoId: videoId, subs: subs }) },
        { title: "Chỉ nghe (Audio)", data: JSON.stringify({ q: "audio", videoId: videoId }) }
    ]);
}
