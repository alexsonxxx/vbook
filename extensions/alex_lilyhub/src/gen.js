// LilyHub - danh sách truyện (dùng chung cho mọi tab)
// input: latest | completed | ongoing | upcoming | cat:<tên thể loại>
//        most-chapters | most-votes | most-views | recently-updated
// page: 1-based (như VBook truyền vào)
//
// LƯU Ý: API PostgREST của LilyHub đôi lúc trả 500 tạm thời (Cloudflare/proxy),
// nên mọi request đều thử lại tối đa 3 lần trước khi báo lỗi.

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

// Gọi API, có retry. Trả về mảng JSON hoặc null.
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

// Bỏ khối <!--META:{...}--> mà site nhúng cuối mô tả.
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

function lilyShortDesc(n) {
    var d = lilyCleanDesc(n.description);
    // "Độ dài: 642 chương" là dòng đầu hay nhất để hiện ở danh sách
    var m = d.match(/Độ dài:[^\n]*/);
    if (m) return m[0];
    if (d.length > 120) return d.substring(0, 120) + "...";
    // Một số truyện chỉ có khối <!--META--> nên mô tả rỗng -> lấy tạm thể loại
    if (!d && n.category) return n.category + "";
    return d ? d : "Chưa có mô tả.";
}

function lilyItem(n) {
    return {
        name: n.title + "",
        link: LILY_SITE + "truyen/" + n.id,
        cover: lilyCover(n.cover_url),
        description: lilyShortDesc(n),
        host: "https://www.lilyhub.top"
    };
}

function execute(input, page) {
    var mode = input + "";
    var pn = parseInt(page + "", 10);
    if (!pn || pn < 1) pn = 1;

    // --- các chế độ sắp xếp server-side (cột có kiểu số/timestamp thật) ---
    var serverOrder = "";
    if (mode === "completed" || mode === "ongoing") {
        serverOrder = "status=eq." + mode + "&order=created_date.desc";
    } else if (mode === "most-chapters") {
        serverOrder = "order=chapter_count.desc";
    } else if (mode === "recently-updated") {
        serverOrder = "order=updated_date.desc";
    } else {
        serverOrder = "order=created_date.desc";
    }

    var select = "id,title,cover_url,description,status,chapter_count,views,rating,votes,category,author,updated_date,created_date";

    // Truyện chưa có chương nào thì không đọc được trong VBook (toc.js sẽ rỗng),
    // nên danh sách luôn loại trừ chúng.
    var readable = "&is_hidden=eq.false&chapter_count=gt.0";

    if (mode.indexOf("cat:") === 0) {
        // Thể loại so khớp cả "Bách Hợp" lẫn "BÁCH HỢP" -> lọc client-side.
        var all = lilyQuery("novels?select=" + select + readable + "&limit=200");
        if (!all) return Response.error("Không lấy được danh sách truyện từ LilyHub.");
        var want = lilyFoldName(mode.substring(4));
        var hit = [];
        for (var i = 0; i < all.length; i++) {
            if (lilyFoldName(all[i].category) === want) hit.push(all[i]);
        }
        if (!hit.length && mode === "cat:Bách Hợp") hit = all;
        var from = (pn - 1) * LILY_PAGE_SIZE;
        var slice = [];
        for (var j = from; j < hit.length && slice.length < LILY_PAGE_SIZE; j++) slice.push(hit[j]);
        var items = [];
        for (var k = 0; k < slice.length; k++) items.push(lilyItem(slice[k]));
        var catNext = (from + LILY_PAGE_SIZE < hit.length) ? String(pn + 1) : null;
        return Response.success(items, catNext);
    }

    if (mode === "most-votes" || mode === "most-views") {
        // votes/views là cột TEXT -> order server ra sai ("9" > "1727"), sắp client-side.
        var list = lilyQuery("novels?select=" + select + readable + "&limit=200");
        if (!list) return Response.error("Không lấy được danh sách truyện từ LilyHub.");
        var field = mode === "most-votes" ? "votes" : "views";
        for (var m = 0; m < list.length; m++) list[m].__num = parseFloat(list[m][field] || 0) || 0;
        var tmp = [];
        for (var n = 0; n < list.length; n++) tmp.push(list[n]);
        tmp.sort(function (a, b) { return b.__num - a.__num; });
        var start = (pn - 1) * LILY_PAGE_SIZE;
        var out = [];
        for (var q = start; q < tmp.length && out.length < LILY_PAGE_SIZE; q++) out.push(lilyItem(tmp[q]));
        var sNext = (start + LILY_PAGE_SIZE < tmp.length) ? String(pn + 1) : null;
        return Response.success(out, sNext);
    }

    // --- phân trang chuẩn: xin thêm 1 dòng để biết còn trang sau không ---
    var rows = lilyQuery("novels?select=" + select + readable + "&" + serverOrder + "&limit=" + (LILY_PAGE_SIZE + 1) + "&offset=" + ((pn - 1) * LILY_PAGE_SIZE));
    if (!rows) return Response.error("Không lấy được danh sách truyện từ LilyHub.");
    var hasMore = rows.length > LILY_PAGE_SIZE;
    var result = [];
    var count = hasMore ? LILY_PAGE_SIZE : rows.length;
    for (var z = 0; z < count; z++) result.push(lilyItem(rows[z]));
    return Response.success(result, hasMore ? String(pn + 1) : null);
}

// Bỏ dấu tiếng Việt + hạ chữ thường, để so khớp "Bách Hợp" với "BÁCH HỢP".
function lilyFoldName(s) {
    var low = (s + "").toLowerCase();
    var out = "";
    var i = 0;
    while (i < low.length) {
        var ch = low.charAt(i);
        var rep = lilyDiacritic(ch);
        out += rep ? rep : ch;
        i++;
    }
    return out;
}

function lilyDiacritic(ch) {
    var map = lilyDiacriticMap();
    var v = map[ch];
    return v ? v : "";
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