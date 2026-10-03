// page.js — execute(url) -> [tocUrl, ...]
// trxs.cc serves the whole chapter list on the detail page itself, so the toc url is the
// book page. Normalise to the canonical /tongren/<id>.html form (the app may drop ".html").
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

function execute(url) {
    var base = getBaseUrl();
    var u = String(url || '');
    var m = u.match(/\/tongren\/(\d+)(?:\.html)?/);
    if (!m) {
        // not a book page — pass it through untouched so toc.js can report the problem
        if (u.indexOf('http') === 0 && u) return Response.success([u]);
        return Response.error('URL không hợp lệ: ' + url);
    }
    return Response.success([base + '/tongren/' + m[1] + '.html']);
}