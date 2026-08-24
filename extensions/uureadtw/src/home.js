load('config.js');
// home.js — category tabs, each tab lists books via search.js (input = sort path).
function execute() {
    return Response.success([
        { title: "玄幻", input: "/sort/1/1.html", script: "search.js" },
        { title: "仙俠", input: "/sort/2/1.html", script: "search.js" },
        { title: "都市", input: "/sort/3/1.html", script: "search.js" },
        { title: "歷史", input: "/sort/4/1.html", script: "search.js" },
        { title: "遊戲", input: "/sort/5/1.html", script: "search.js" },
        { title: "科幻", input: "/sort/6/1.html", script: "search.js" },
        { title: "靈異", input: "/sort/7/1.html", script: "search.js" },
        { title: "言情", input: "/sort/8/1.html", script: "search.js" },
        { title: "其它", input: "/sort/9/1.html", script: "search.js" },
        { title: "全本小說", input: "/full/all/1.html", script: "search.js" }
    ]);
}
