// search.js — execute(key, page) -> [{name, link, cover, description, host}], nextPage
//
// The site stores everything in GB2312, so the keyword must be form-encoded as GBK or the
// backend matches nothing (verified: plain UTF-8 POST for 火影 returns
// "没有搜索到相关的内容"). The WebView encodes form bodies with the document charset, so
// page 1 is driven through the site's own search form via Engine.newBrowser().
// That page also hands out a `searchid`; later pages are plain ASCII urls and are fetched
// directly: /e/search/result/index.php?page=<0-based>&searchid=<id>.
// NOTE: the site allows only one search per 60 seconds (系统限制的搜索时间间隔为 60 秒).
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

function parseItems(doc, base) {
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
        var name = '';
        var img = a.select('img').first();
        if (img) { var alt = cleanText(img.attr('alt')); if (alt) name = alt; }
        if (!name) { var h3 = a.select('h3').first(); if (h3) name = cleanText(h3.text()); }
        if (name) name = cleanText(name.replace(/[（(][^）)]*[）)]\s*$/, ''));
        if (!name) continue;
        seen[id] = 1;
        var item = {name: name, link: base + '/tongren/' + id + '.html', cover: '', host: base};
        if (img) {
            var src = cleanText(img.attr('src'));
            if (src && src.indexOf('nocover') === -1) item.cover = absUrl(src);
        }
        var news = a.select('.booknews').first();
        if (news) { var d = cleanText(news.text()); if (d) item.description = d; }
        data.push(item);
    }
    return data;
}

// Highest page number advertised by the search pager (page param is 0-based there).
function maxPage(doc) {
    var sel = doc.select('.page a[href*="searchid="]');
    var best = 0;
    for (var i = 0; i < sel.size(); i++) {
        var h = String(sel.get(i).attr('href') || '');
        var m = h.match(/[?&]page=(\d+)/);
        if (m) { var n = parseInt(m[1], 10); if (!isNaN(n) && n > best) best = n; }
    }
    return best;
}

function execute(key, page) {
    var base = getBaseUrl();
    var k = cleanText(key);
    if (!k) return Response.error('Thiếu từ khoá tìm kiếm');
    var pRaw = (page === undefined || page === null) ? '' : String(page).replace(/\s/g, '');
    var pn = parseInt(pRaw, 10);
    if (isNaN(pn) || pn < 1) pn = 1;

    var doc = null;
    var searchId = '';

    if (pn > 1) {
        try { searchId = localStorage.getItem('trxs_searchid') + ''; } catch (e) { searchId = ''; }
        if (!searchId) return Response.error('Hết phiên tìm kiếm, hãy tìm lại từ trang 1.');
        var res;
        try {
            res = fetch(base + '/e/search/result/index.php?page=' + (pn - 1) + '&searchid=' + searchId, {
                headers: {'User-Agent': UA, 'Referer': base + '/'}, timeout: 25000
            });
        } catch (e2) {
            return Response.error('Lỗi tải trang ' + pn + ': ' + e2);
        }
        if (!res.ok) return Response.error('HTTP ' + res.status);
        doc = res.html('gbk');
    } else {
        var b = Engine.newBrowser();
        try {
            b.setUserAgent(UA);
            b.launch(base + '/', 15000);
            b.callJs("(function(){var f=document.querySelector('form.formSearch');if(!f){return 'NOFORM';}var i=f.querySelector('input[name=keyboard]');if(!i){return 'NOINPUT';}i.value=" + JSON.stringify(k) + ";f.submit();return 'SUBMITTED';})()", 8000);
            // The result page arrives in ~0.5-2s; the "信息提示" page auto-redirects back
            // to the home page after 3s, so poll instead of sleeping a fixed long time.
            for (var t = 0; t < 10; t++) {
                sleep(600);
                doc = b.html(6000);
                var ti = String(doc.select('title').text() || '');
                if (ti.indexOf('搜索结果') !== -1 || ti.indexOf('信息提示') !== -1) break;
            }
            if (doc) {
                var title2 = String(doc.select('title').text() || '');
                var body2 = String(doc.select('body').text() || '');
                if (title2.indexOf('搜索结果') === -1) {
                    var mb = body2.match(/([^ ]{4,40}搜索[^ ]{0,20})/);
                    return Response.error('Tìm kiếm thất bại' + (mb ? ': ' + cleanText(mb[1]) : '.'));
                }
                var html2 = doc.html() + '';
                var ms = html2.match(/searchid=(\d+)/);
                if (ms) {
                    searchId = ms[1];
                    try { localStorage.setItem('trxs_searchid', searchId); } catch (e3) {}
                }
            }
        } catch (e4) {
            return Response.error('Lỗi trình duyệt tìm kiếm: ' + e4);
        } finally {
            b.close();
        }
    }

    if (!doc) return Response.error('Không đọc được trang kết quả tìm kiếm.');
    var data = parseItems(doc, base);
    if (data.length === 0) return Response.error('Không tìm thấy "' + k + '"');

    var next = null;
    var mp = maxPage(doc);
    // page param on the result url is 0-based: page 1 of the app == index 0.
    if (pn <= mp) next = String(pn + 1);
    return Response.success(data, next);
}