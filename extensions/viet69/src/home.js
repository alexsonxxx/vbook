// home.js ? Danh s?ch tab trang ch?
// Contract: execute() ? [{ title, input, script }]
load("config.js");

function execute() {
    return Response.success([
        { title: "M\u1edbi nh\u1ea5t",           input: BASE_URL + "/",          script: "gen.js" },
        { title: "Video c\u1ee7a th\u00e0nh vi\u00ean", input: BASE_URL + "/bai-viet/", script: "gen.js" }
    ]);
}
