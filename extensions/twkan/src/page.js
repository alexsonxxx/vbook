// page.js — execute(url) -> [tocUrl, ...]
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}

function execute(url) {
    url = String(url || '');
    var m = url.match(/\/(\d+)\.html/);
    var id = m ? m[1] : '';
    if (id) return Response.success([BASE_URL + "/ajax_novels/chapterlist/" + id + ".html"]);
    return Response.success([url]);
}
