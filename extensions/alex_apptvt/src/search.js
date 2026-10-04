load('api.js');

// search.js — double duty: keyword search and tab/category browsing.
// execute(query, page): `query` is either a search keyword or an API path
// (starting with /) passed from home.js / genre.js / detail.js.
function execute(query, page) {
    query = query || '';
    page = page || '0';

    if (query.indexOf('/') === 0 || query.indexOf(BASE_URL) === 0) {
        var path = query;
        if (path.indexOf(BASE_URL) === 0) path = path.substring(BASE_URL.length);
        return browseOffset(path, page);
    }

    var offset = parseInt(page, 10);
    if (isNaN(offset) || offset < 0) offset = 0;
    var json = apiGet('/stories/filter?offset=' + offset + '&limit=' + PAGE_LIMIT +
        '&keyword=' + encodeURIComponent(query));
    if (!json || !json.data) return Response.error('Không tìm được kết quả');
    var items = storyItems(json.data);
    var nextPage = json.data.length >= PAGE_LIMIT ? String(offset + PAGE_LIMIT) : '';
    return Response.success(items, nextPage);
}
