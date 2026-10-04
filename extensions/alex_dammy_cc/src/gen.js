// gen.js — paginated listing parser for home.js tabs and genre.js entries.
// `input` is a category path or full category url, `page` is the next-page
// token returned by the previous call (a page number as string).
load('config.js');

function execute(input, page) {
    var p = page ? String(page) : '1';
    var url = categoryUrl(input, p);
    if (!url) return Response.error('Thiếu danh mục (input).');

    var response = fetch(url);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    var doc = response.html();

    var items = parseCards(doc);
    if (items.length === 0) {
        return Response.error('Không tìm thấy truyện trên trang (có thể cấu trúc trang đã đổi).');
    }

    var next = hasNextPage(doc) ? nextPageToken(p) : null;
    return Response.success(items, next);
}
