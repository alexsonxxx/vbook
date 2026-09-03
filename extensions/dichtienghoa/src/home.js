// home.js — Tab trang chủ
// Contract: execute() → [{ title, input, script }]
// input là API path truyền vào gen.js (gen.js tự thêm page/limit)
load("config.js");
function execute() {
    return Response.success([
        { title: "Mới cập nhật", input: "/home/bootstrap?tab=newest", script: "gen.js" },
        { title: "Hoàn thành", input: "/home/bootstrap?tab=completed", script: "gen.js" },
        { title: "Xếp hạng ngày", input: "/ranking/bootstrap?rank=daily", script: "gen.js" },
        { title: "Xếp hạng tuần", input: "/ranking/bootstrap?rank=weekly", script: "gen.js" }
    ]);
}