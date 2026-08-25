// config.js — lohi2 (LoHi)
// API: https://api.lohi2.com/novel (yêu cầu Authorization: Bearer <access_token>)
var BASE_URL = "https://lohi2.com";
var API_URL = "https://api.lohi2.com/novel";
var USER_AGENT = "Mozilla/5.0 (Linux; Android 14; SM-F741N Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36";
var PAGE_SIZE = 24;

// Đọc config field an toàn (unset config bị inject dạng JSON definition — lesson 18)
function configText(name) {
    try {
        var raw = this[name];
        raw = raw === undefined || raw === null ? "" : String(raw);
        raw = raw.replace(/"/g, "").trim();
        if (raw.charAt(0) === "{" && raw.charAt(raw.length - 1) === "}") return "";
        return raw;
    } catch (e) {
        return "";
    }
}

// Lấy token: ưu tiên config, fallback localStorage
function getAccessToken() {
    var tok = configText("access_token");
    if (!tok) {
        try { tok = localStorage.getItem("lohi2_access_token") || ""; } catch (e) { tok = ""; }
    }
    return tok;
}

function getRefreshToken() {
    var tok = configText("refresh_token");
    if (!tok) {
        try { tok = localStorage.getItem("lohi2_refresh_token") || ""; } catch (e) { tok = ""; }
    }
    return tok;
}

// Fetch với Bearer token + UA. Tự refresh khi 401 nếu có refresh_token.
function apiFetch(url, opts) {
    var options = opts || {};
    var headers = options.headers || {};
    headers["User-Agent"] = USER_AGENT;

    var token = getAccessToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    options.headers = headers;
    if (!options.timeout) options.timeout = 20000;

    var res = fetch(url, options);
    if (res && res.status === 401 && getRefreshToken()) {
        var refreshed = doRefresh();
        if (refreshed) {
            headers["Authorization"] = "Bearer " + getAccessToken();
            res = fetch(url, options);
        }
    }
    return res;
}

// Refresh token qua POST /auth/refresh (cần Cookie access_token + refresh_token)
function doRefresh() {
    try {
        var refreshTok = getRefreshToken();
        if (!refreshTok) return false;
        var cookie = "access_token=" + getAccessToken() + "; refresh_token=" + refreshTok;
        var res = fetch(API_URL + "/auth/refresh", {
            method: "POST",
            headers: {
                "User-Agent": USER_AGENT,
                "Content-Type": "application/json",
                "Origin": "https://lohi2.com",
                "Referer": "https://lohi2.com/",
                "Cookie": cookie
            },
            body: JSON.stringify({ refresh_token: refreshTok }),
            timeout: 20000
        });
        if (!res || !res.ok) return false;
        var setCookie = "";
        try { setCookie = res.headers["set-cookie"] || res.headers["Set-Cookie"] || ""; } catch (e) {}
        var m = (setCookie + "").match(/access_token=([^;]+)/);
        if (m && m[1]) {
            try { localStorage.setItem("lohi2_access_token", m[1] + ""); } catch (e) {}
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

// Rút slug từ URL web: /truyen/{slug} hoặc /truyen/{slug}/chuong-{n}
function slugFromUrl(url) {
    var m = (url || "").match(/\/truyen\/([^\/?#]+)/);
    return m ? decodeURIComponent(m[1]) : "";
}

// Map 1 item novel từ API → object VBook
function mapNovelItem(item) {
    var genres = item.genres || [];
    var descParts = [];
    if (item.authorVi) descParts.push(item.authorVi);
    if (item.totalChapters) descParts.push(item.totalChapters + " chương");
    if (genres.length > 0) descParts.push(genres.join(", "));

    return {
        name: item.titleVi || item.titleCn || item.slug || "",
        link: BASE_URL + "/truyen/" + item.slug,
        cover: item.coverImageUrl || "",
        description: descParts.join(" • "),
        host: BASE_URL
    };
}
