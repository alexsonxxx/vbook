// config.js — shared constants/helpers for the trxs.cc (同人小说网) extension.
//
// NOTE: every src script is intentionally SELF-CONTAINED (helpers inlined instead of
// load("config.js")) so the scripts also run through the VBook /extension/test debug
// endpoint, where load() is not available. This file documents the shared shape and is
// kept for convention. Rhino-safe: var only, no ES6.
var DEFAULT_BASE_URL = 'https://trxs.cc';
var UA = 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

// The site is GB2312 — always decode with res.html("gbk") / res.text("gbk").

// Config global `base_url` may arrive as undefined, "", or the raw JSON definition
// ({"title":...}) when the user never edited it — treat all of those as "not set".
function getBaseUrl() {
    var raw = '';
    try { if (typeof base_url !== 'undefined') raw = base_url; } catch (e) {}
    raw = String(raw === null || raw === undefined ? '' : raw).replace(/"/g, '').trim();
    if (!raw || raw.charAt(0) === '{') return DEFAULT_BASE_URL;
    if (raw.indexOf('http') !== 0) raw = DEFAULT_BASE_URL;
    return raw.replace(/\/+$/, '');
}

function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return getBaseUrl() + u; return getBaseUrl() + '/' + u; }
function cleanText(s) { return String(s === null || s === undefined ? '' : s).replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }
function stripTags(s) { return String(s || '').replace(/<[^>]*>/g, ''); }

// /tongren/<id>.html -> <id>; returns "" when the url is not a book page.
function bookId(url) {
    var m = String(url || '').match(/\/tongren\/(\d+)\.html/);
    return m ? m[1] : '';
}