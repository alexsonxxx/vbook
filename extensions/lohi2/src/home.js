// home.js — Các tab trang chủ
// Contract: execute() → [{ title, input, script }]
// input là URL API discovery (gen.js sẽ tự thêm limit/offset)
load("config.js");
function execute() {
    return Response.success([
        { title: "Mới cập nhật", input: API_URL + "/discovery/feed?sort=new", script: "gen.js" },
        { title: "Hot", input: API_URL + "/discovery/feed?sort=hot", script: "gen.js" },
        { title: "Tất cả", input: API_URL + "/novels", script: "gen.js" },
        { title: "Tiên Hiệp", input: API_URL + "/discovery/feed?genres=" + encodeURIComponent("Tiên Hiệp"), script: "gen.js" },
        { title: "Ngôn Tình", input: API_URL + "/discovery/feed?genres=" + encodeURIComponent("Ngôn Tình"), script: "gen.js" },
        { title: "Hoàn thành", input: API_URL + "/novels?status=completed", script: "gen.js" }
    ]);
}
