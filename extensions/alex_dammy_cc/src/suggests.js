// suggests.js — referenced from detail.js `suggests`.
// `input` is a JSON string of {name, link, cover} items scraped from the
// detail page's "Truyện Hot" widget, so no extra fetch is needed.
load('config.js');

function execute(input) {
    var items = [];
    try {
        var parsed = JSON.parse(String(input || '[]'));
        for (var i = 0; i < parsed.length; i++) {
            var it = parsed[i];
            var name = String(it && it.name ? it.name : '').trim();
            var link = normalizeLink(it && it.link ? it.link : '');
            if (!name || !link) continue;
            items.push({
                name: name,
                link: link,
                cover: String(it && it.cover ? it.cover : ''),
                host: BASE_URL
            });
        }
    } catch (e) {
        return Response.error('Dữ liệu truyện đề xuất bị lỗi.');
    }

    if (items.length === 0) {
        return Response.error('Không có truyện đề xuất.');
    }
    return Response.success(items, '');
}
