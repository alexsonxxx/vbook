// genre.js — Danh sách thể loại + quốc gia
// Contract: execute() → [{ title, input, script }]
// Thật: menu trang chủ có /the-loai/* và /quoc-gia/*, phân trang bằng ?page=N
function execute() {
    load('config.js');
    return Response.success([
        { title: "JAV",           input: BASE_URL + "/the-loai/jav?page={{page}}",           script: "gen.js" },
        { title: "JAV HD",        input: BASE_URL + "/the-loai/jav-hd?page={{page}}",        script: "gen.js" },
        { title: "JAV Vietsub",   input: BASE_URL + "/the-loai/jav-vietsub?page={{page}}",   script: "gen.js" },
        { title: "Vietsub",       input: BASE_URL + "/the-loai/vietsub?page={{page}}",       script: "gen.js" },
        { title: "Không che",     input: BASE_URL + "/the-loai/khong-che?page={{page}}",     script: "gen.js" },
        { title: "Sex HD",        input: BASE_URL + "/the-loai/sexhd?page={{page}}",         script: "gen.js" },
        { title: "Sex Không Che", input: BASE_URL + "/the-loai/sex-khong-che?page={{page}}", script: "gen.js" },
        { title: "Tập thể",       input: BASE_URL + "/the-loai/tap-the?page={{page}}",       script: "gen.js" },
        { title: "Vùng trộm",     input: BASE_URL + "/the-loai/vung-trom?page={{page}}",     script: "gen.js" },
        { title: "Gái xinh",      input: BASE_URL + "/the-loai/gai-xinh?page={{page}}",      script: "gen.js" },
        { title: "Hentai",        input: BASE_URL + "/the-loai/hentai?page={{page}}",        script: "gen.js" },
        { title: "Nhật Bản",      input: BASE_URL + "/quoc-gia/nhat-ban?page={{page}}",      script: "gen.js" },
        { title: "Hàn Quốc",      input: BASE_URL + "/quoc-gia/han-quoc?page={{page}}",      script: "gen.js" },
        { title: "Trung Quốc",    input: BASE_URL + "/quoc-gia/trung-quoc?page={{page}}",    script: "gen.js" },
        { title: "Việt Nam",      input: BASE_URL + "/quoc-gia/viet-nam?page={{page}}",      script: "gen.js" },
        { title: "Âu Mỹ",         input: BASE_URL + "/quoc-gia/au-my?page={{page}}",         script: "gen.js" }
    ]);
}
