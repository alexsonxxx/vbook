// genre.js — Danh sách thể loại (từ tag-tabs thật trên trang chủ)
// Contract: execute() → [{ title, input, script }]
load("config.js");
function execute() {
    return Response.success([
        { title: "Xuyên việt", input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191af", script: "gen.js" },
        { title: "Trọng sinh", input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191b4", script: "gen.js" },
        { title: "Cổ đại",     input: BASE_URL + "/tim-kiem?qs=2&age=5794f03dd7ced228f441919b", script: "gen.js" },
        { title: "Hiện đại",   input: BASE_URL + "/tim-kiem?qs=2&age=5794f03dd7ced228f441919d", script: "gen.js" },
        { title: "Tương lai",  input: BASE_URL + "/tim-kiem?qs=2&age=5794f03dd7ced228f441919e&tag=5794f03dd7ced228f44191c6", script: "gen.js" },
        { title: "Mạt thế",    input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191ac", script: "gen.js" },
        { title: "Huyền huyễn", input: BASE_URL + "/tim-kiem?qs=2&genre=57d17c94d7ced218fcd2734b", script: "gen.js" },
        { title: "Ma pháp",    input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191b0", script: "gen.js" },
        { title: "Võ hiệp",    input: BASE_URL + "/tim-kiem?qs=2&genre=5794f03dd7ced228f44191a3", script: "gen.js" },
        { title: "Tiên hiệp",  input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191ad&genre=5794f03dd7ced228f44191a4", script: "gen.js" },
        { title: "Võng du",    input: BASE_URL + "/tim-kiem?qs=2&genre=5794f03dd7ced228f44191a5", script: "gen.js" },
        { title: "Làm ruộng",  input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191c0", script: "gen.js" },
        { title: "Mỹ thực",    input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191c5", script: "gen.js" },
        { title: "Kinh dị",    input: BASE_URL + "/tim-kiem?qs=2&genre=5794f03dd7ced228f44191a6", script: "gen.js" },
        { title: "Hệ thống",   input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191b6", script: "gen.js" },
        { title: "Cung đấu",   input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191d7", script: "gen.js" },
        { title: "Trinh thám", input: BASE_URL + "/tim-kiem?qs=2&tag=5794f03dd7ced228f44191c1&genre=5794f03dd7ced228f44191a7", script: "gen.js" },
        { title: "Hoàn thành", input: BASE_URL + "/tim-kiem?qs=2&status=5794f03dd7ced228f4419191", script: "gen.js" }
    ]);
}