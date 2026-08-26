let BASE_URL = "https://www.youtube.com";
try {
    if (DOMAIN) {
        BASE_URL = DOMAIN;
    }
} catch (error) {
}

// Rewrite an incoming url's host (old/mirror/www-prefixed) to BASE_URL.
function normalizeUrl(url) {
    return url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
}

// YouTube embeds its page data as `var ytInitialData = {...};` / `var ytInitialPlayerResponse = {...};`
// inside a <script> tag — never real DOM nodes, so a balanced-brace extract over the raw text is
// the only way to reach them (regex-over-JSON-blob case per SKILL.md).
function extractJson(html, key) {
    let marker = "var " + key + " = ";
    let idx = html.indexOf(marker);
    if (idx === -1) {
        marker = "window." + key + " = ";
        idx = html.indexOf(marker);
        if (idx === -1) return "";
        idx = html.indexOf("{", idx);
    } else {
        idx = html.indexOf("{", idx + marker.length);
    }
    if (idx === -1) return "";
    let depth = 0;
    for (let i = idx; i < html.length; i++) {
        let c = html.charAt(i);
        if (c === "{") {
            depth++;
        } else if (c === "}") {
            depth--;
            if (depth === 0) return html.substring(idx, i + 1);
        }
    }
    return "";
}

// Title runs: [{text:"a"},{text:"b"}] -> "ab"
function runsText(runs) {
    let s = "";
    if (!runs) return s;
    for (let i = 0; i < runs.length; i++) {
        s += runs[i].text || "";
    }
    return s;
}

// Thumbnails are listed smallest->largest; the last one is the best quality.
function pickThumb(thumbnails) {
    if (!thumbnails || thumbnails.length === 0) return "";
    return thumbnails[thumbnails.length - 1].url || "";
}

// Description/detail fields are rendered as HTML by the app — escape raw text
// and turn newlines into <br> so plain-text YouTube descriptions display safely.
function escHtml(s) {
    s = String(s || "");
    s = s.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/\n/g, "<br>");
    return s;
}

// NOTE on playback quality (verified against the app + YouTube):
// - The player plays exactly ONE stream per track (`audios[]` picks which,
//   it never muxes) and cannot open data:/non-http manifests.
// - YouTube's per-variant HLS playlists are video-only (audio rides in the
//   master manifest's EXT-X-MEDIA groups), so intermediate locked qualities
//   cannot carry sound here. Only two sound-safe modes exist:
//     * the full HLS master (adaptive, best quality), and
//     * the muxed progressive mp4 (itag 18, 360p).
// chap.js therefore offers exactly those two choices.
