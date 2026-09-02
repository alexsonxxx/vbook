// chap.js — execute(url) -> HTML content string (not an object)
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}
function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return BASE_URL + u; return BASE_URL + '/' + u; }

function execute(url) {
    url = absUrl(url);
    var res = fetch(url, {timeout: 15000});
    if (!res.ok) return Response.error('HTTP ' + res.status);
    var doc = res.html();
    var cont = doc.select('#txtcontent0').first();
    if (!cont) {
        cont = doc.select('#txtcontent').first();
    }
    if (!cont) return Response.error('Nội dung chương trống');
    cont.select('script, style, .txtad, .txtcenter, ins, .sharebtn, iframe').remove();
    var html = String(cont.html() || '');

    // watermark: 本書由<site>全網首發
    html = html.replace(/本書由[\s\S]*?全網首發/g, '');

    // strip the in-content chapter title line: 　第557章 ...<br>
    html = html.replace(/^(\s|\u00a0|&emsp;|　)*第\d+章[^<]*<br\s*\/?\s*>/i, '');

    // collapse leading/trailing <br>
    html = html.replace(/^(\s*<br\s*\/?\s*>)+/, '');
    html = html.replace(/(<br\s*\/?\s*>\s*)+$/, '');
    // drop stray newline-only runs at the edges (keep em-space indentation)
    html = html.replace(/^\n+/, '');
    html = html.replace(/\n+$/, '');

    return Response.success(html);
}
