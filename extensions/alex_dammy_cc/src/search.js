// search.js — search by keyword on dammy.cc.
// Result pages use the same card markup as the listing pages.
load('config.js');

function execute(query, page) {
    var q = String(query || '').trim();
    if (!q) return Response.error('Nhập từ khóa tìm kiếm.');

    var p = page ? String(page) : '1';
    var url = BASE_URL + '/tim-kiem?search=' + encodeURIComponent(q) + '&page=' + p;

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var doc = response.html();

    var items = parseCards(doc);
    if (items.length === 0) {
        return Response.error('Không tìm thấy truyện phù hợp.');
    }

    var next = hasNextPage(doc) ? nextPageToken(p) : null;
    return Response.success(items, next);
}
