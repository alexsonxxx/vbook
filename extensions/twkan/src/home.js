// home.js — execute() -> tabs, each feeds gen.js
var BASE_URL = 'https://twkan.com';
try { var _cu = String(typeof CONFIG_URL === 'undefined' ? '' : CONFIG_URL).replace(/["']/g, '').trim(); if (_cu.indexOf('http') === 0) BASE_URL = _cu.replace(/\/+$/, ''); } catch (e) {}

function execute() {
    return Response.success([
        {title: "熱門", input: BASE_URL + "/novels/newhot_0_0_{{page}}.html", script: "gen.js"},
        {title: "完本", input: BASE_URL + "/novels/newfull_0_0_{{page}}.html", script: "gen.js"},
        {title: "全部分類", input: BASE_URL + "/novels/class/0_{{page}}.html", script: "gen.js"}
    ]);
}
