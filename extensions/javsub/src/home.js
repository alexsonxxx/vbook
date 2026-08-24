// home.js — Danh sách tab trang chủ
// Contract: execute() → [{ title, input, script }]
function execute() {
    load('config.js');
    return Response.success([
        { title: "Mới cập nhật", input: BASE_URL + "/", script: "gen.js" }
    ]);
}
