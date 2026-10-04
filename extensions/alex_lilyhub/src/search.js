// LilyHub - tìm kiếm
// API PostgREST dùng `ilike` nhưng ở đây ilike lại phân biệt HOA/thường và
// không bỏ dấu ("DUYÊN" không khớp "duyen"), nên ta tải danh sách (site nhỏ)
// rồi tự so khớp không phân biệt HOA/thường + bỏ dấu: "nguoi" sẽ ra "NGƯỜI".

var LILY_API = "https://vnchwolfbckhhherrzjk.supabase.co/rest/v1/";
var LILY_SITE = "https://www.lilyhub.top/";
var LILY_KEY = "sb_publishable_fBI0JdeuAHrlZGg_2wA_oA_-oHzhiKk";
var LILY_PAGE_SIZE = 20;

function lilyHeaders() {
    return {
        "apikey": LILY_KEY,
        "Authorization": "Bearer " + LILY_KEY,
        "Content-Type": "application/json"
    };
}

function lilyQuery(path) {
    var attempt = 0;
    while (attempt < 3) {
        var res = null;
        try {
            res = fetch(LILY_API + path, { headers: lilyHeaders(), timeout: 20000 });
        } catch (e) { res = null; }
        attempt++;
        if (res && res.ok) {
            var txt = "";
            try { txt = res.text() + ""; } catch (e2) { txt = ""; }
            var parsed = null;
            try { parsed = JSON.parse(txt); } catch (e3) { parsed = null; }
            if (parsed) return parsed;
        }
        if (attempt < 3) sleep(600 * attempt);
    }
    return null;
}

function lilyCleanDesc(raw) {
    var s = raw + "";
    var i = s.indexOf("<!--META:");
    if (i >= 0) {
        var j = s.indexOf("-->", i);
        s = j >= 0 ? s.substring(0, i) + s.substring(j + 3) : s.substring(0, i);
    }
    return s.replace(/^\s+|\s+$/g, "");
}

function lilyShortDesc(n) {
    var d = lilyCleanDesc(n.description);
    var m = d.match(/Độ dài:[^\n]*/);
    if (m) return m[0];
    if (d.length > 120) return d.substring(0, 120) + "...";
    if (!d && n.category) return n.category + "";
    return d ? d : "Chưa có mô tả.";
}

function lilyCover(u) {
    var s = u + "";
    if (!s) return "";
    if (s.indexOf("http") === 0) return s;
    return LILY_SITE + s.replace(/^\//, "");
}

// Bỏ dấu tiếng Việt + hạ chữ thường
function lilyFold(s) {
    var map = lilyDiacriticMap();
    var low = (s + "").toLowerCase();
    var out = "";
    var i = 0;
    while (i < low.length) {
        var ch = low.charAt(i);
        var v = map[ch];
        out += v ? v : ch;
        i++;
    }
    return out;
}

function lilyDiacriticMap() {
    var m = {};
    var groups = [
        ["àáạảãâầấậẩẫăằắặẳẵ", "a"],
        ["èéẹẻẽêềếệểễ", "e"],
        ["ìíịỉĩ", "i"],
        ["òóọỏõôồốộổỗơờớợởỡ", "o"],
        ["ùúụủũưừứựửữ", "u"],
        ["ỳýỷỹỵ", "y"],
        ["đ", "d"]
    ];
    for (var g = 0; g < groups.length; g++) {
        var chars = groups[g][0];
        var base = groups[g][1];
        var i = 0;
        while (i < chars.length) {
            m[chars.charAt(i)] = base;
            i++;
        }
    }
    return m;
}

function execute(keyword, page) {
    var kw = keyword + "";
    if (!kw) return Response.error("Vui lòng nhập từ khoá tìm kiếm.");
    var pn = parseInt(page + "", 10);
    if (!pn || pn < 1) pn = 1;

    // chapter_count=gt.0: truyện chưa có chương thì không đọc được trong VBook
    var rows = lilyQuery("novels?select=id,title,author,cover_url,description,status,chapter_count,category&is_hidden=eq.false&chapter_count=gt.0&limit=200");
    if (!rows) return Response.error("Không lấy được danh sách truyện từ LilyHub.");

    var needle = lilyFold(kw);
    var hit = [];
    for (var i = 0; i < rows.length; i++) {
        var title = lilyFold(rows[i].title);
        var author = lilyFold(rows[i].author);
        if (title.indexOf(needle) >= 0 || author.indexOf(needle) >= 0) hit.push(rows[i]);
    }

    if (!hit.length) return Response.success([], null);

    var from = (pn - 1) * LILY_PAGE_SIZE;
    var out = [];
    for (var j = from; j < hit.length && out.length < LILY_PAGE_SIZE; j++) {
        var n = hit[j];
        out.push({
            name: n.title + "",
            link: LILY_SITE + "truyen/" + n.id,
            cover: lilyCover(n.cover_url),
            description: lilyShortDesc(n),
            host: "https://www.lilyhub.top"
        });
    }
    var next = (from + LILY_PAGE_SIZE < hit.length) ? String(pn + 1) : null;
    return Response.success(out, next);
}