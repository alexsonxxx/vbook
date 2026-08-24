// home.js — Tabs trang chủ
// Contract: execute() → [{ title, input, script }]
// Thật: /danh-sach/phim-moi (phim mới, ?page=N tới 1851),
//       /the-loai/jav-hd, /the-loai/vietsub (?page=243), /the-loai/khong-che (?page=369)
function execute() {
    load('config.js');
    return Response.success([
        { title: "Mới cập nhật", input: BASE_URL + "/danh-sach/phim-moi?page={{page}}", script: "gen.js" },
        { title: "JAV HD",       input: BASE_URL + "/the-loai/jav-hd?page={{page}}",     script: "gen.js" },
        { title: "Vietsub",      input: BASE_URL + "/the-loai/vietsub?page={{page}}",    script: "gen.js" },
        { title: "Không che",    input: BASE_URL + "/the-loai/khong-che?page={{page}}",  script: "gen.js" }
    ]);
}
