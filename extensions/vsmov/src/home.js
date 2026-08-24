// home.js — Danh sách tab trang chủ VSMOV (API JSON)
// Contract: execute() → [{ title, input, script }]
// Mỗi item = 1 tab. "input" là URL truyền vào gen.js, {{page}} được thay tự động
load("config.js");

function execute() {
    return Response.success([
        { title: "Phim Mới Cập Nhật", input: BASE_URL + "/api/danh-sach/phim-moi-cap-nhat?page={{page}}", script: "gen.js" },
        { title: "Phim Lẻ",            input: BASE_URL + "/api/danh-sach/phim-le?page={{page}}",            script: "gen.js" },
        { title: "Phim Bộ",            input: BASE_URL + "/api/danh-sach/phim-bo?page={{page}}",            script: "gen.js" },
        { title: "Phim Đang Chiếu",    input: BASE_URL + "/api/danh-sach/dang-chieu?page={{page}}",         script: "gen.js" },
        { title: "Phim Chiếu Rạp",     input: BASE_URL + "/api/danh-sach/phim-chieu-rap?page={{page}}",     script: "gen.js" },
        { title: "Phim Thuyết Minh",   input: BASE_URL + "/api/danh-sach/thuyet-minh?page={{page}}",        script: "gen.js" },
        { title: "Phim Lồng Tiếng",    input: BASE_URL + "/api/danh-sach/long-tieng?page={{page}}",         script: "gen.js" },
        { title: "Phim 4K",            input: BASE_URL + "/api/danh-sach/4k?page={{page}}",                 script: "gen.js" }
    ]);
}
