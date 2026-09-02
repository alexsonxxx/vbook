// toc.js — execute(url) -> [{name, url, host}]
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}
function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return BASE_URL + u; return BASE_URL + '/' + u; }
function cleanText(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }

function execute(url) {
    url = String(url || '');
    // tolerate a book/detail url by extracting the id; otherwise expect the ajax url
    var m = url.match(/\/(\d+)\.html/);
    if (m && url.indexOf('chapterlist') === -1) {
        url = BASE_URL + "/ajax_novels/chapterlist/" + m[1] + ".html";
    }
    var res = fetch(url, {timeout: 15000});
    if (!res.ok) return Response.error('HTTP ' + res.status);
    var doc = res.html();
    var data = [];
    var seen = {};
    doc.select('ul > li > a').forEach(function (a) {
        var name = cleanText(a.text());
        var link = absUrl(String(a.attr('href') || ''));
        if (!name || !link || seen[link]) return;
        seen[link] = true;
        data.push({name: name, url: link, host: BASE_URL});
    });
    return Response.success(data);
}
