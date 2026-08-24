// genre.js — Danh sách thể loại (từ menu navbar thật)
// Contract: execute() → [{ title, input, script }]
function execute() {
    load('config.js');
    return Response.success([
        { title: "Không Che",       input: BASE_URL + "/the-loai/khong-che",       script: "gen.js" },
        { title: "Vietsub",         input: BASE_URL + "/the-loai/vietsub",         script: "gen.js" },
        { title: "Phim Sex HD",     input: BASE_URL + "/the-loai/phim-sex-hd",     script: "gen.js" },
        { title: "Uncensored Leak", input: BASE_URL + "/the-loai/uncensored-leak", script: "gen.js" },
        { title: "Vú To",           input: BASE_URL + "/the-loai/vu-to",           script: "gen.js" },
        { title: "Mông to",         input: BASE_URL + "/the-loai/mong-to",         script: "gen.js" },
        { title: "Doggy",           input: BASE_URL + "/the-loai/doggy",           script: "gen.js" },
        { title: "Bú cu",           input: BASE_URL + "/the-loai/bu-cu",           script: "gen.js" },
        { title: "Tập Thể",         input: BASE_URL + "/the-loai/tap-the",         script: "gen.js" },
        { title: "VLXX",            input: BASE_URL + "/the-loai/vlxx",            script: "gen.js" },
        { title: "JAV HD",          input: BASE_URL + "/the-loai/jav-hd",          script: "gen.js" }
    ]);
}
