// home.js (Comic)
// Contract: execute() → [{ title, input, script }]
load("config.js");

function execute() {
    return Response.success([
        { title: "Mới cập nhật", input: BASE_URL + "/tim-kiem-nang-cao?page={{page}}", script: "gen.js" },
        { title: "Xếp hạng",     input: BASE_URL + "/tim-kiem-nang-cao?sort=rating&page={{page}}", script: "gen.js" },
        { title: "Hoàn thành",   input: BASE_URL + "/tim-kiem-nang-cao?status=Ho%C3%A0n+th%C3%A0nh&page={{page}}", script: "gen.js" },
    ]);
}