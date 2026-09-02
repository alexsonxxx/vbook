// genre.js — execute() -> category tabs, each feeds gen.js
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}

function execute() {
    var out = [];
    var seen = {};
    var res = fetch(BASE_URL + "/novels/class", {timeout: 15000});
    if (res.ok) {
        var doc = res.html();
        doc.select('a[href*="/novels/class/"]').forEach(function (a) {
            if (out.length >= 20) return;
            var href = String(a.attr('href') || '');
            var m = href.match(/\/novels\/class\/(\d+)_(\d+)\.html/);
            if (!m) return;
            var title = clean(a.text());
            var id = m[1];
            var input = BASE_URL + "/novels/class/" + id + "_{{page}}.html";
            if (!title || seen[input]) return;
            seen[input] = true;
            out.push({title: title, input: input, script: "gen.js"});
        });
    }
    if (out.length === 0) {
        var fallback = [
            ["玄幻奇幻", "1"], ["武俠仙俠", "2"], ["現代都市", "3"], ["歷史軍事", "4"],
            ["科幻小說", "5"], ["遊戲競技", "6"], ["恐怖靈異", "7"], ["言情小說", "8"],
            ["動漫同人", "9"], ["其他類型", "10"]
        ];
        for (var i = 0; i < fallback.length; i++) {
            out.push({title: fallback[i][0], input: BASE_URL + "/novels/class/" + fallback[i][1] + "_{{page}}.html", script: "gen.js"});
        }
    }
    return Response.success(out);
}

function clean(s) { return String(s || '').replace(/\s+/g, ' ').replace(/^ +| +$/g, ''); }
