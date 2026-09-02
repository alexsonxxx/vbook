// gen.js — execute(url, page) -> list of novels + nextPage (string or null)
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}

function pageUrl(u, page) { u = String(u || ''); if (u.indexOf('{{page}}') > -1) return u.replace('{{page}}', String(page)); if (u.indexOf('http') !== 0) { if (u.charAt(0) !== '/') u = '/' + u; u = BASE_URL + u; } return u; }
function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return BASE_URL + u; return BASE_URL + '/' + u; }
function cleanText(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }

function execute(url, page) {
    if (!page) page = "1";
    var target = pageUrl(url, page);
    var res = fetch(target, {timeout: 15000});
    if (!res.ok) return Response.error('HTTP ' + res.status);
    var doc = res.html();
    var data = [];
    var seen = {};
    doc.select('#article_list_content li').forEach(function (li) {
        var nameEl = li.select('h3 > a:not([class])').first();
        if (!nameEl) nameEl = li.select('h3 > a').first();
        if (!nameEl) return;
        var name = cleanText(nameEl.text());
        var link = absUrl((nameEl.attr('href') || ''));
        if (!name || !link || seen[link]) return;
        seen[link] = true;
        var item = {name: name, link: link, cover: '', host: BASE_URL};
        var img = li.select('.imgbox > img').first();
        if (img) {
            var cov = cleanText((img.attr('data-src') || '') + '' || (img.attr('src') || ''));
            if (cov && cov.indexOf('nocover') === -1) item.cover = absUrl(cov);
        }
        var ol = li.select('ol').first();
        if (ol) { var d = cleanText(ol.text()); if (d) item.description = d; }
        data.push(item);
    });
    var next = null;
    var nEl = doc.select('.pagelink a.next').first();
    if (nEl) { var nh = (nEl.attr('href') || ''); if (nh) next = String(parseInt(page, 10) + 1); }
    return Response.success(data, next);
}
