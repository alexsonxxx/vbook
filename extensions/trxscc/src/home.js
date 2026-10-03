// home.js — execute() -> [{title, input, script}] tabs, each parsed by gen.js
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

function execute() {
    var b = getBaseUrl();
    return Response.success([
        {title: '同人小说', input: b + '/tongren/', script: 'gen.js'},
        {title: '全本同人', input: b + '/tags-150-0.html', script: 'gen.js'},
        {title: '连载同人', input: b + '/tags-151-0.html', script: 'gen.js'},
        {title: '高分榜单', input: b + '/rating/', script: 'gen.js'}
    ]);
}