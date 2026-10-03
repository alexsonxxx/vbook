// gen.js — execute(url, page) -> [{name, link, cover, description, host}], nextPage
//
// Verified listing shapes on trxs.cc (all GB2312):
//   /tongren/                 page 1   (page n>=2 -> /tongren/index_<n>.html, 1-based)
//   /tongren/index_<n>.html    page n
//   /tags-<tagId>-<k>.html     0-based (k = page-1)
//   /rating/                   single page, no #pageNum
// Every list page renders items as  <div class="books m-cols"><div class="bk">
//   <a href="/tongren/<id>.html"> <div class="pic"><img src=... alt=...></div>
//   <div class="infos"><h3>title(range)</h3><div class="booknews">作者: X ..</div><p>...</p></div></a>
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
function cleanText(s) { return String(s === null || s === undefined ? '' : s).replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }

// Resolve the real listing url for a 1-based page number.
// The app substitutes {{page}} with '' on the first tab page, so `page` must be
// normalized here instead of blindly replacing the placeholder.
function buildUrl(input, page) {
    var u = String(input || '');
    var p = (page === undefined || page === null) ? '' : String(page).replace(/\s/g, '');
    var pn = parseInt(p, 10);
    if (isNaN(pn) || pn < 1) pn = 1;

    var m = u.match(/^(https?:\/\/[^\/]+)\/tags-(\d+)-(\d+)\.html$/);
    if (m) return m[1] + '/tags-' + m[2] + '-' + (pn - 1) + '.html';

    m = u.match(/^(https?:\/\/[^\/]+)\/tongren\/(?:index(?:_\d+)?\.html)?$/);
    if (m) {
        if (pn === 1) return m[1] + '/tongren/';
        return m[1] + '/tongren/index_' + pn + '.html';
    }

    u = u.replace('{{page}}', p === '' ? '1' : p);
    return u;
}

// Last page number advertised by the site's own #pageNum pager (absent => single page).
function maxPage(doc) {
    var sel = doc.select('#pageNum a[href]');
    var best = 0;
    for (var i = 0; i < sel.size(); i++) {
        var h = String(sel.get(i).attr('href') || '');
        var m = h.match(/(\d+)(?:\.html)?$/);
        if (m) {
            var n = parseInt(m[1], 10);
            if (!isNaN(n) && n > best) best = n;
        }
    }
    return best;
}

function execute(url, page) {
    var target = buildUrl(url, page);
    var res;
    try {
        res = fetch(target, {headers: {'User-Agent': UA, 'Referer': getBaseUrl() + '/'}, timeout: 25000});
    } catch (e) {
        return Response.error('Lỗi tải ' + target + ': ' + e);
    }
    if (!res.ok) return Response.error('HTTP ' + res.status + ' - ' + target);

    var doc = res.html('gbk');
    var base = getBaseUrl();
    var data = [];
    var seen = {};
    var sel = doc.select('.books .bk a[href*="/tongren/"]');
    for (var i = 0; i < sel.size(); i++) {
        var a = sel.get(i);
        var href = String(a.attr('href') || '');
        var m = href.match(/^\/tongren\/(\d+)\.html$/);
        if (!m) continue;
        var id = m[1];
        if (seen[id]) continue;

        // Clean book name: the cover <img alt> has it without the "(1-490)"/"(全本)" suffix.
        var name = '';
        var img = a.select('img').first();
        if (img) {
            var alt = cleanText(img.attr('alt'));
            if (alt) name = alt;
        }
        if (!name) {
            var h3 = a.select('h3').first();
            if (h3) name = cleanText(h3.text());
        }
        if (name) name = name.replace(/[（(][^）)]*[）)]\s*$/, '');
        name = cleanText(name);
        if (!name) continue;

        seen[id] = 1;
        var item = {name: name, link: base + '/tongren/' + id + '.html', cover: '', host: base};
        if (img) {
            var src = cleanText(img.attr('src'));
            if (src && src.indexOf('nocover') === -1) item.cover = absUrl(src);
        }
        var news = a.select('.booknews').first();
        if (news) {
            var d = cleanText(news.text());
            if (d) item.description = d;
        } else {
            var p = a.select('p').first();
            if (p) {
                var d2 = cleanText(p.text());
                if (d2) item.description = d2;
            }
        }
        data.push(item);
    }

    if (data.length === 0) return Response.error('Không có dữ liệu tại ' + target);

    var next = null;
    var mp = maxPage(doc);
    if (mp > 0) {
        var pn = parseInt(String(page || '1').replace(/\s/g, ''), 10);
        if (isNaN(pn) || pn < 1) pn = 1;
        // /tags-N-<k>.html is 0-based => its pager numbers are page indexes, so the
        // highest advertised number equals the last page index.
        if (pn < mp) next = String(pn + 1);
    }
    return Response.success(data, next);
}