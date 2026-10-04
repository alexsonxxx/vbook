// LilyHub - thông tin truyện
// url có thể là https://www.lilyhub.top/truyen/<uuid> hoặc chỉ uuid.

var LILY_API = "https://vnchwolfbckhhherrzjk.supabase.co/rest/v1/";
var LILY_SITE = "https://www.lilyhub.top/";
var LILY_KEY = "sb_publishable_fBI0JdeuAHrlZGg_2wA_oA_-oHzhiKk";

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

// Rút uuid truyện từ url web (…/truyen/<uuid>[/<n>]) hoặc từ chuỗi uuid thuần.
function lilyNovelId(input) {
    var s = (input + "").replace(/^\s+|\s+$/g, "");
    var parts = s.split("/");
    for (var i = parts.length - 1; i >= 0; i--) {
        var seg = parts[i];
        if (seg.indexOf("-") > 0 && seg.length >= 32 && /^[0-9a-fA-F-]+$/.test(seg)) return seg;
    }
    var m = s.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    if (m) return m[0];
    return "";
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

function lilyCover(u) {
    var s = u + "";
    if (!s) return "";
    if (s.indexOf("http") === 0) return s;
    return LILY_SITE + s.replace(/^\//, "");
}

function lilyStatusText(s) {
    if (s === "completed") return "Hoàn thành";
    if (s === "ongoing") return "Đang cập nhật";
    if (s === "upcoming") return "Sắp ra mắt";
    return s + "";
}

// Chẩn đoán 1 lần: status thật + 120 ký tự đầu body, để lỗi hiện ra trong app.
var LILY_DIAG = null;
function lilyDiag() {
    if (LILY_DIAG !== null) return LILY_DIAG;
    var parts = [];
    try {
        var res = fetch(LILY_API + "novels?select=id&limit=1", { headers: lilyHeaders(), timeout: 15000 });
        if (!res) {
            parts.push("fetch=null");
        } else {
            parts.push("status=" + res.status + ",ok=" + res.ok);
            var t = "";
            try { t = res.text() + ""; } catch (e) { t = ""; }
            parts.push("len=" + t.length + ",head=" + t.substring(0, 120));
        }
    } catch (e) {
        parts.push("exception=" + (e + ""));
    }
    LILY_DIAG = parts.join(" ");
    return LILY_DIAG;
}

function execute(url) {
    var id = "";
    var rows = null;
    try {
        id = lilyNovelId(url);
        if (!id) return Response.error("Không đọc được mã truyện từ URL này: " + url);
        rows = lilyQuery("novels?select=*&id=eq." + id + "&limit=1");
    } catch (e) {
        return Response.error("Lỗi khi gọi LilyHub: " + (e + ""));
    }

    if (!rows) {
        // Báo kèm chẩn đoán để biết là lỗi mạng / khoá / parse chứ không phải "im lặng".
        return Response.error("Không lấy được dữ liệu. id=" + id + " | " + lilyDiag());
    }
    if (!rows.length) return Response.error("Không tìm thấy truyện này trên LilyHub. id=" + id);

    var n = rows[0];
    var desc = lilyCleanDesc(n.description);
    if (!desc) desc = "Chưa có mô tả.";

    var author = (n.author ? n.author + "" : "Ẩn danh");
    if (n.translator) author = author + " (Dịch: " + n.translator + ")";

    var genres = [];
    if (n.category) genres.push({ title: n.category + "", input: "cat:" + n.category, script: "gen.js" });
    var tags = [];
    if (n.tags && n.tags.length) {
        for (var i = 0; i < n.tags.length; i++) {
            if (n.tags[i]) tags.push(n.tags[i] + "");
        }
    }

    var chCount = parseInt(n.chapter_count, 10);
    if (isNaN(chCount)) chCount = 0;
    var info = [];
    info.push("Tác giả: " + author);
    info.push("Tình trạng: " + lilyStatusText(n.status));
    info.push("Số chương: " + chCount);
    if (tags.length) info.push("Nhãn: " + tags.join(", "));
    if (n.votes) info.push("Lượt thích: " + n.votes);
    if (n.views) info.push("Lượt xem: " + n.views);
    if (n.rating) info.push("Điểm: " + n.rating);

    return Response.success({
        name: n.title + "",
        cover: lilyCover(n.cover_url),
        host: "https://www.lilyhub.top",
        author: author,
        description: desc,
        ongoing: n.status === "ongoing",
        genres: genres,
        detail: info.join("<br>")
    });
}
