// twkan (台灣小說網) — shared base/helpers.
// Scripts are self-contained (no load()) so they also work through the
// /extension/test debug endpoint; this file is kept for convention and is
// Rhino-safe (var only).
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}
function absUrl(u) { u = String(u || ''); if (!u) return ''; if (u.indexOf('http') === 0) return u; if (u.indexOf('//') === 0) return 'https:' + u; if (u.charAt(0) === '/') return BASE_URL + u; return BASE_URL + '/' + u; }
function cleanText(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }
function pageUrl(u, page) { u = String(u || ''); if (u.indexOf('{{page}}') > -1) return u.replace('{{page}}', String(page)); return u; }
