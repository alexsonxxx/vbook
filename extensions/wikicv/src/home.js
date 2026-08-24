// home.js — Các tab danh sách
// Contract: execute() → [{ title, input, script }]
load("config.js");
function execute() {
    return Response.success([
        { title: "Chương mới",    input: BASE_URL + "/chuong-moi?start={{page}}",     script: "gen.js" },
        { title: "Truyện nam",    input: BASE_URL + "/truyen-nam",                    script: "gen.js" },
        { title: "Nữ tần",        input: BASE_URL + "/nu-tan",                        script: "gen.js" },
        { title: "Đam mỹ",        input: BASE_URL + "/dam-my",                        script: "gen.js" },
        { title: "Bảng xếp hạng", input: BASE_URL + "/bang-xep-hang?start={{page}}",  script: "gen.js" }
    ]);
}