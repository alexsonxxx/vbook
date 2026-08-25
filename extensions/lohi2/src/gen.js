// gen.js — Danh sách truyện từ API listing
// Contract: execute(url, page) → [{ name*, link*, cover?, description?, host?, tag? }], nextPage?
// url là API URL: /novels?param=value hoặc /discovery/feed?param=value
// page là số trang bắt đầu từ "1"
load("config.js");
function execute(url, page) {
    if (!page) page = "1";
    var p = Math.max(parseInt(page, 10) || 1, 1);
    var offset = (p - 1) * PAGE_SIZE;

    // Xây API URL với limit & offset
    var apiUrl = url;
    if (apiUrl.indexOf("?") >= 0) {
        apiUrl = apiUrl + "&limit=" + PAGE_SIZE + "&offset=" + offset;
    } else {
        apiUrl = apiUrl + "?limit=" + PAGE_SIZE + "&offset=" + offset;
    }

    var res = apiFetch(apiUrl);
    if (!res || !res.ok) {
        var errMsg = !res ? "API unreachable" : ("Lỗi: " + res.status);
        return Response.error(errMsg);
    }

    var json = res.json();
    if (!json) return Response.error("API trả về lỗi");

    // Discovery/feed trả array; /novels trả array; /novels/search trả {matches}
    var items = json;
    if (items.matches) items = items.matches;

    if (!items || !items.length) return Response.error("Không có dữ liệu");

    var data = [];
    var seen = {};
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var link = BASE_URL + "/truyen/" + item.slug;
        if (seen[link]) continue;
        seen[link] = true;

        var obj = mapNovelItem(item);
        data.push(obj);
    }

    var hasNext = items.length >= PAGE_SIZE;
    var nextPage = hasNext ? String(p + 1) : null;
    return Response.success(data, nextPage);
}