// toc.js — execute(url) -> [{name, url, host}]
//
// Primary source: the book page's inline chapter list
//   div.book_list > ul > li > a[href="/tongren/<id>/<n>.html"]   text like "第1节"
// Fallback (verified needed for e.g. /tongren/11670.html, whose page ships no list):
// read the 尾章 link from chapter 1 and generate 1..<last>.
// Accepts either the book page or a chapter url.
var DEFAULT_BASE_URL = 'https://trxs.cc';
var UA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

function getBaseUrl() {
    var raw = '';
    try { if (typeof base_url !== 'undefined') raw = base_url; } catch (e) {}
    raw = String(raw === null || raw === undefined ? '' : raw).replace(/"/g, '').trim();
    if (!raw || raw.charAt(0) === '{') return DEFAULT_BASE_URL;
    if (raw.indexOf('http') !== 0) return DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
}
function absUrl(u) { var b = getBaseUrl(); u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return b + u; return b + '/' + u; }
function cleanText(s) { return String(s === null || s === undefined ? '' : s).replace(/[\s\u3000]+/g, ' ').replace(/^ +| +$/g, ''); }

function fetchGbk(url) {
    var res = fetch(url, {headers: {'User-Agent': UA, 'Referer': getBaseUrl() + '/'}, timeout: 25000});
    if (!res.ok) return null;
    return res.html('gbk');
}

function execute(url) {
    var base = getBaseUrl();
    var u = String(url || '');
    var m = u.match(/\/tongren\/(\d+)(?:\.html|\/(\d+)\.html)?/);
    if (!m) return Response.error('URL không hợp lệ: ' + url);
    var id = m[1];
    var bookUrl = base + '/tongren/' + id + '.html';

    var doc = fetchGbk(bookUrl);
    if (!doc) return Response.error('Không tải được trang truyện: ' + bookUrl);

    var data = [];
    var seen = {};
    var sel = doc.select('.book_list ul li a[href]');
    for (var i = 0; i < sel.size(); i++) {
        var a = sel.get(i);
        var href = String(a.attr('href') || '');
        var mm = href.match(/^\/tongren\/(\d+)\/(\d+)\.html$/);
        if (!mm || mm[1] !== id) continue;
        var link = base + href;
        if (seen[link]) continue;
        var name = cleanText(a.text());
        if (!name) name = '第' + mm[2] + '节';
        seen[link] = 1;
        data.push({name: name, url: link, host: base});
    }

    if (data.length === 0) {
        // No inline list on this book page: derive the range from chapter 1's 尾章 link.
        var c1 = fetchGbk(base + '/tongren/' + id + '/1.html');
        if (!c1) return Response.error('Mục lục trống cho truyện ' + id);
        var nav = c1.select('.pageNav a[href]');
        var last = 0;
        for (var j = 0; j < nav.size(); j++) {
            var h = String(nav.get(j).attr('href') || '');
            var t = cleanText(nav.get(j).text());
            var mm2 = h.match(/^\/tongren\/(\d+)\/(\d+)\.html$/);
            if (!mm2 || mm2[1] !== id) continue;
            if (t.indexOf('尾章') !== -1) {
                var n = parseInt(mm2[2], 10);
                if (!isNaN(n) && n > last) last = n;
            }
        }
        if (last < 1) return Response.error('Không tìm thấy danh sách chương cho truyện ' + id);
        for (var k = 1; k <= last; k++) {
            data.push({name: '第' + k + '节', url: base + '/tongren/' + id + '/' + k + '.html', host: base});
        }
    }

    if (data.length === 0) return Response.error('Mục lục trống cho truyện ' + id);
    return Response.success(data);
}