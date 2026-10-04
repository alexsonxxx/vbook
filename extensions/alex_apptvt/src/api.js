// Shared helpers for the APP TYT extension (app com.tytno).
// API base: https://api.noveltyt.app/api/v2/
// Auth: public endpoints need 4 headers (verified live 2026-10-04):
//   User-Agent: volley/0, client-id: tytno, client-token: tytno, client-version: 141
//   (client-platform=android BREAKS chapters/detail; omit it everywhere.)
var BASE_URL = 'https://api.noveltyt.app/api/v2';
var API_HEADERS = {
    'User-Agent': 'volley/0',
    'client-id': 'tytno',
    'client-token': 'tytno',
    'client-version': '141'
};

function apiGet(path) {
    var url = path.indexOf('http') === 0 ? path : BASE_URL + path;
    var response = fetch(url, { headers: API_HEADERS, timeout: 30000 });
    if (!response.ok) return null;
    try {
        return JSON.parse(response.text());
    } catch (e) {
        return null;
    }
}

// A story object -> VBook list item. Link is a pseudo-link carrying the 24-hex id.
function storyItem(s) {
    if (!s || !s.id) return null;
    var tag = '';
    if (s.full) {
        tag = 'Hoàn thành';
    } else if (s.chapter_count) {
        tag = s.chapter_count + ' chương';
    }
    var desc = '';
    if (s.author) desc = 'Tác giả: ' + s.author;
    if (s.view_count) desc += (desc ? ' • ' : '') + s.view_count + ' lượt xem';
    return {
        name: (s.title || '') + '',
        link: BASE_URL + '/stories/' + s.id + '/detail',
        cover: (s.cover || '') + '',
        description: desc + '',
        tag: tag + '',
        host: BASE_URL
    };
}

function storyItems(list) {
    var items = [];
    if (!list) return items;
    for (var i = 0; i < list.length; i++) {
        var it = storyItem(list[i]);
        if (it) items.push(it);
    }
    return items;
}

// Browse a paginated list endpoint with offset/limit. Returns next-page token
// as the next offset, or '' when the page came back short.
var PAGE_LIMIT = 36;

function browseOffset(path, page) {
    page = page || '0';
    var offset = parseInt(page, 10);
    if (isNaN(offset) || offset < 0) offset = 0;
    var sep = path.indexOf('?') === -1 ? '?' : '&';
    var json = apiGet(path + sep + 'offset=' + offset + '&limit=' + PAGE_LIMIT);
    if (!json || !json.data || !json.data.length) {
        if (json && json.status && (!json.data || !json.data.length)) return Response.success([], '');
        return Response.error('Không tải được danh sách');
    }
    var items = storyItems(json.data);
    var nextPage = json.data.length >= PAGE_LIMIT ? String(offset + PAGE_LIMIT) : '';
    return Response.success(items, nextPage);
}

// Pull the 24-hex story id out of a pseudo-link (or a tytnovel.info/truyen/<id> URL).
function storyIdOf(url) {
    var m = String(url).match(/([a-f0-9]{24})/);
    return m ? m[1] : '';
}
