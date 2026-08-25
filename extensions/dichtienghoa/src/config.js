// config.js — dichtienghoa (Dịch Tiếng Hoa) — .net / .site / domain tùy chỉnh
// - base_url config: "auto" (tự dò .net → .site) hoặc domain bất kỳ khi site đổi domain
// - lang config: "vi" (bản dịch tiếng Việt, cần login) | "zh" (bản gốc tiếng Trung)
// Nuxt 4 + API yêu cầu CSRF (cookie _csrfToken + query _csrfToken).
var FALLBACK_CSRF = "1wfcRpG3D0X2hWDnAYieWQrgwa6HJMglAgXq8chTHms";
var PAGE_SIZE = 24;

function configText(name) {
    try {
        var raw = this[name];
        raw = raw === undefined || raw === null ? "" : String(raw);
        return raw.replace(/"/g, "").trim();
    } catch (e) {
        return "";
    }
}

function normalizeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (u.indexOf("http://") !== 0 && u.indexOf("https://") !== 0) u = "https://" + u;
    u = u.replace(/\/+$/, "");
    return u;
}

// Domain hoạt động: config base_url (nếu khác "auto") → cache localStorage → dò .net → .site
function resolveBaseUrl() {
    var cfg = configText("base_url");
    if (cfg && cfg !== "auto" && cfg !== "auto") {
        var n = normalizeUrl(cfg);
        if (n) return n;
    }
    try {
        var cached = localStorage.getItem("dth_base");
        if (cached && cached.indexOf("http") === 0) return cached;
    } catch (e) {}
    var candidates = ["https://dichtienghoa.net", "https://dichtienghoa.site"];
    for (var i = 0; i < candidates.length; i++) {
        try {
            var r = fetch(candidates[i] + "/", { headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" }, timeout: 10000 });
            if (r && r.ok) {
                try { localStorage.setItem("dth_base", candidates[i]); } catch (e2) {}
                return candidates[i];
            }
        } catch (e) {}
    }
    return "https://dichtienghoa.net";
}

var BASE_URL = resolveBaseUrl();
var API_URL = BASE_URL + "/api";

function defaultHeaders(extra) {
    var h = {
        "accept": "application/json, text/plain, */*",
        "origin": BASE_URL,
        "referer": BASE_URL + "/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    if (extra) {
        for (var k in extra) {
            if (extra.hasOwnProperty(k) && extra[k] != null) h[k] = extra[k];
        }
    }
    return h;
}

function parseJson(res) {
    if (!res) return null;
    try {
        if (typeof res.json === "function") {
            var j = res.json();
            if (j) return j;
        }
    } catch (e) {}
    try {
        var t = res.text();
        if (t) return JSON.parse(t);
    } catch (e2) {}
    return null;
}

function getCsrfTokenFromCookie(cookie) {
    var match = (((cookie || "") + "").match(/_csrfToken=([^;,\s<]+)/) || []);
    return match[1] || "";
}

function mergeCookie(oldCookie, setCookie) {
    var map = {};
    function put(part) {
        part = (part || "").trim();
        if (!part) return;
        var eq = part.indexOf("=");
        if (eq < 1) return;
        var k = part.slice(0, eq).trim();
        var v = part.slice(eq + 1).trim();
        var low = k.toLowerCase();
        if (low === "path" || low === "domain" || low === "expires" || low === "max-age" || low === "secure" || low === "httponly" || low === "samesite") return;
        map[k] = v;
    }
    var oldParts = (oldCookie || "").split(";");
    for (var i = 0; i < oldParts.length; i++) put(oldParts[i]);
    var chunks = String(setCookie || "").split(/,(?=[^;]+?=)/);
    for (var j = 0; j < chunks.length; j++) {
        var first = chunks[j].split(";")[0];
        put(first);
    }
    var out = [];
    for (var key in map) {
        if (map.hasOwnProperty(key)) out.push(key + "=" + map[key]);
    }
    return out.join("; ");
}

function persistCookie(cookie) {
    if (!cookie || typeof localCookie === "undefined") return;
    try { localCookie.setCookie(cookie); } catch (e) {}
}

function readCookie() {
    if (typeof localCookie === "undefined") return "";
    try { return localCookie.getCookie() || ""; } catch (e) { return ""; }
}

function getValidTokenAndCookie() {
    var cookie = readCookie();
    var csrfToken = getCsrfTokenFromCookie(cookie);
    if (!csrfToken) {
        try {
            var res = fetch(BASE_URL + "/", { headers: defaultHeaders() });
            if (res && res.ok) {
                var setCookie = res.headers["set-cookie"] || res.headers["Set-Cookie"] || "";
                if (!setCookie && res.request && res.request.headers) {
                    setCookie = res.request.headers.cookie || res.request.headers.Cookie || "";
                }
                cookie = mergeCookie(cookie, setCookie);
                csrfToken = getCsrfTokenFromCookie(cookie) || getCsrfTokenFromCookie(setCookie);
                if (csrfToken) {
                    cookie = mergeCookie(cookie, "_csrfToken=" + csrfToken);
                    persistCookie(cookie);
                }
            }
        } catch (e) {}
    }
    if (!csrfToken) {
        csrfToken = FALLBACK_CSRF;
        cookie = mergeCookie(cookie, "_csrfToken=" + csrfToken);
        persistCookie(cookie);
    }
    return { token: csrfToken, cookie: cookie };
}

// Gọi API với CSRF + cookie. Retry 1 lần khi 403 (refresh cookie qua home).
function apiFetch(path, opts) {
    opts = opts || {};
    var tc = getValidTokenAndCookie();
    var sep = path.indexOf("?") >= 0 ? "&" : "?";
    var url = path.indexOf("http") === 0 ? path : (API_URL + path);
    if (url.indexOf("_csrfToken=") < 0) {
        url = url + sep + "_csrfToken=" + encodeURIComponent(tc.token);
    }
    var headers = defaultHeaders(opts.headers || {});
    headers["Cookie"] = tc.cookie;
    if (opts.referer) headers["referer"] = opts.referer;

    var res = null;
    try {
        res = fetch(url, {
            method: opts.method || "GET",
            headers: headers,
            body: opts.body
        });
    } catch (e) { res = null; }
    if (!res) return null;

    // Cloudflare rate-limit trả về HTML (body bắt đầu bằng "<") dù status khác
    // — không phải JSON, coi như thất bại để chap.js có đường fallback.
    try {
        if (res.status === 404 || res.status === 429) {
            var peek = "";
            try { peek = res.text() || ""; } catch (e3) {}
            if (peek.charAt(0) === "<") {
                return null;
            }
        }
    } catch (e4) {}

    var setCookie = res.headers["set-cookie"] || res.headers["Set-Cookie"] || "";
    if (setCookie) {
        var merged = mergeCookie(tc.cookie, setCookie);
        persistCookie(merged);
    }

    if (res.status === 403) {
        try {
            var homeRes = fetch(BASE_URL + "/", { headers: defaultHeaders() });
            if (homeRes && homeRes.ok) {
                var sc = homeRes.headers["set-cookie"] || homeRes.headers["Set-Cookie"] || "";
                var newCookie = mergeCookie(readCookie(), sc);
                var newToken = getCsrfTokenFromCookie(newCookie) || getCsrfTokenFromCookie(sc);
                if (newToken) {
                    newCookie = mergeCookie(newCookie, "_csrfToken=" + newToken);
                    persistCookie(newCookie);
                    var url2 = path.indexOf("http") === 0 ? path : (API_URL + path);
                    url2 = url2.replace(/([?&])_csrfToken=[^&]*/g, "$1").replace(/[?&]$/, "");
                    url2 = url2 + (url2.indexOf("?") >= 0 ? "&" : "?") + "_csrfToken=" + encodeURIComponent(newToken);
                    headers["Cookie"] = newCookie;
                    res = fetch(url2, {
                        method: opts.method || "GET",
                        headers: headers,
                        body: opts.body
                    });
                }
            }
        } catch (e2) {}
    }
    return res;
}

// Đăng nhập nếu có username/password config và chưa có access_token.
// Trước hết thử refresh từ refresh_token có sẵn trong cookie (không cần mật khẩu).
function loginIfNeeded() {
    var cookie = readCookie();
    if (cookie.indexOf("access_token") !== -1) return;

    // Thử refresh bằng refresh_token (đã có trong cookie từ browser session)
    if (cookie.indexOf("refresh_token") !== -1) {
        var rm = cookie.match(/refresh_token=([^;]+)/);
        if (rm) {
            var tc = getValidTokenAndCookie();
            try {
                var refreshRes = fetch(API_URL + "/auth/refresh?_csrfToken=" + encodeURIComponent(tc.token), {
                    method: "POST",
                    headers: defaultHeaders({
                        "Content-Type": "application/json",
                        "Cookie": tc.cookie
                    }),
                    body: JSON.stringify({ refreshToken: rm[1] })
                });
                if (refreshRes && refreshRes.ok) {
                    var sc = refreshRes.headers["set-cookie"] || refreshRes.headers["Set-Cookie"] || "";
                    var merged = mergeCookie(tc.cookie, sc);
                    persistCookie(merged);
                    if (readCookie().indexOf("access_token") !== -1) return; // đã có access_token
                }
            } catch (e) {}
        }
    }

    var username = configText("username");
    var password = configText("password");
    if (!username || !password) return;

    try {
        var loginRes = fetch(API_URL + "/auth/login?_csrfToken=" + encodeURIComponent(tc.token), {
            method: "POST",
            headers: defaultHeaders({
                "Content-Type": "application/json",
                "Cookie": tc.cookie
            }),
            body: JSON.stringify({
                identifier: username,
                password: password
            })
        });
        if (!loginRes || !loginRes.ok) return;

        var setCookie = loginRes.headers["set-cookie"] || loginRes.headers["Set-Cookie"] || "";
        var merged = mergeCookie(tc.cookie, setCookie);
        var loginJson = parseJson(loginRes);
        if (loginJson && loginJson.data && loginJson.data.accessToken) {
            merged = mergeCookie(merged, "access_token=" + loginJson.data.accessToken);
        } else if (loginJson && loginJson.accessToken) {
            merged = mergeCookie(merged, "access_token=" + loginJson.accessToken);
        }
        persistCookie(merged);
    } catch (e) {}
}

// Rút storyId từ URL: /truyen/{id}
function storyIdFromUrl(url) {
    var m = (url || "").match(/\/truyen\/(\d+)/);
    return m ? m[1] : "";
}

function extractChapterIds(url) {
    if (!url) return null;
    var m = String(url).match(/\/truyen\/(\d+)\/(\d+)/);
    if (!m) return null;
    return { storyId: m[1], chapterId: m[2] };
}

// Map 1 item novel → object VBook
function mapNovelItem(item) {
    var descParts = [];
    if (item.authorName) descParts.push(item.authorName.replace(/^\s+|\s+$/g, ""));
    if (item.chapterCount) descParts.push(item.chapterCount + " chương");
    if (item.status === "completed") descParts.push("Hoàn thành");
    else if (item.status === "ongoing") descParts.push("Đang ra");
    if (item.categoryNames) descParts.push(item.categoryNames);

    return {
        name: (item.title || "").replace(/^\s+|\s+$/g, ""),
        link: BASE_URL + "/truyen/" + item.id,
        cover: item.imgUrl || item.img || "",
        description: descParts.join(" • "),
        host: BASE_URL
    };
}

// Map host của sourceUrl → tên crawl API (/api/models/crawl/{name}/...)
function getSourceName(sourceUrl) {
    if (!sourceUrl) return "";
    var u = String(sourceUrl).toLowerCase();
    if (u.indexOf("book.qq.com") >= 0) return "bookqq";
    if (u.indexOf("m.novel.qq.com") >= 0) return "m.novel.qq.com";
    if (u.indexOf("ubook.reader.qq.com") >= 0) return "ubook.reader.qq.com";
    if (u.indexOf("69shuba") >= 0) return "69shuba";
    if (u.indexOf("82zg.com") >= 0) return "82zg.com";
    if (u.indexOf("faloo") >= 0) return "faloo";
    if (u.indexOf("fanqienovel.com") >= 0 || u.indexOf("fanqie") >= 0) return "fanqienovel";
    if (u.indexOf("magev6.if.qidian.com") >= 0) return "magev6.if.qidian.com";
    if (u.indexOf("m.qidian.com") >= 0) return "m.qidian.com";
    if (u.indexOf("qidian.com") >= 0) return "qidian.com";
    if (u.indexOf("piaotia.com") >= 0 || u.indexOf("piaotian.com") >= 0) return "piaotia";
    if (u.indexOf("trxs") >= 0) return "trxs";
    if (u.indexOf("uukanshu") >= 0) return "uukanshu";
    return "";
}

// Crawl nội dung từ nguồn gốc qua API — không cần đăng nhập
function crawlContent(sourceUrl, storyId, chapterId) {
    if (!sourceUrl) return "";
    var sourceName = getSourceName(sourceUrl);
    if (!sourceName) {
        try {
            var srcRes = apiFetch("/models/source?pageSize=100", { referer: BASE_URL + "/truyen/" + storyId + "/" + chapterId });
            var srcJson = parseJson(srcRes);
            var list = (srcJson && srcJson.data) ? srcJson.data : [];
            for (var i = 0; i < list.length; i++) {
                var src = list[i];
                if (src && src.baseUrl && sourceUrl.indexOf(src.baseUrl) === 0) {
                    sourceName = src.name;
                    break;
                }
            }
        } catch (e) {}
    }
    if (!sourceName) return "";

    var crawlRes = apiFetch(
        "/models/crawl/" + encodeURIComponent(sourceName) + "/content?url=" + encodeURIComponent(sourceUrl),
        { referer: BASE_URL + "/truyen/" + storyId + "/" + chapterId }
    );
    if (!crawlRes || !crawlRes.ok) return "";
    var crawlJson = parseJson(crawlRes);
    if (!crawlJson) return "";
    return crawlJson.chapterConent || crawlJson.chapterContent || crawlJson.content ||
        (crawlJson.data && (crawlJson.data.chapterConent || crawlJson.data.chapterContent || crawlJson.data.content)) || "";
}

function formatContent(content) {
    if (!content) return "";
    var html = String(content);
    if (html.indexOf("<p") < 0 && html.indexOf("<br") < 0 && html.indexOf("<div") < 0) {
        html = html
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .replace(/\n/g, "<br>");
    }
    return html;
}