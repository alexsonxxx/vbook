// detail.js — execute(url) -> {name, cover, host, author, description, detail, ongoing, genres}
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}
function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return BASE_URL + u; return BASE_URL + '/' + u; }
function cleanText(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }
function meta(doc, prop) { var el = doc.select('meta[property="' + prop + '"]').first(); return el ? String(el.attr('content') || '') : ''; }

function execute(url) {
    url = absUrl(url);
    var res = fetch(url, {timeout: 15000});
    if (!res.ok) return Response.error('HTTP ' + res.status);
    var doc = res.html();

    var name = meta(doc, 'og:novel:book_name');
    var cover = meta(doc, 'og:image');
    var author = meta(doc, 'og:novel:author');
    var statusText = meta(doc, 'og:novel:status');
    var category = meta(doc, 'og:novel:category');

    // fallbacks from DOM
    if (!name) { var h1 = doc.select('.booknav2 h1 a').first(); if (h1) name = cleanText(h1.text()); }
    if (!cover) { var ci = doc.select('.bookimg2 img').first(); if (ci) cover = absUrl(String(ci.attr('src') || '')); }
    if (!author) { var pa = doc.select('.booknav2 p a').first(); if (pa) author = cleanText(pa.text()); }

    // description
    var desc = meta(doc, 'og:description');
    var np = doc.select('.navtxt p').first();
    if (np) desc = cleanText(np.text());

    var ongoing = true;
    if (statusText) ongoing = statusText.indexOf('全本') === -1 && statusText.indexOf('完結') === -1 && statusText.indexOf('完本') === -1;

    // detail meta line
    var parts = [];
    doc.select('.booknav2 p').forEach(function (p) { var t = cleanText(p.text()); if (t) parts.push(t); });
    var detail = parts.join('<br>');

    // genre action from breadcrumb /novels/class/{id}_{page}.html
    var genres = [];
    var catId = '';
    var catTitle = category;
    var bc = doc.select('.bread a[href*="/novels/class/"]').first();
    if (bc) {
        var ch = String(bc.attr('href') || '');
        if (!catTitle) catTitle = cleanText(bc.text());
        var m = ch.match(/\/novels\/class\/(\d+)_\d+\.html/);
        if (m) catId = m[1];
    }
    if (catId && catTitle) {
        genres.push({title: catTitle, input: BASE_URL + "/novels/class/" + catId + "_{{page}}.html", script: "gen.js"});
    }

    return Response.success({name: name, cover: cover, host: BASE_URL, author: author, description: desc, detail: detail, ongoing: ongoing, genres: genres});
}
