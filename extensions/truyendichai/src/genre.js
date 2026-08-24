var BASE_URL = "https://truyendich.fit";

function execute() {
    return Response.success([
        { title: "Tiên Hiệp",    input: BASE_URL + "/the-loai/tien-hiep",    script: "gen.js" },
        { title: "Kiếm Hiệp",    input: BASE_URL + "/the-loai/kiem-hiep",    script: "gen.js" },
        { title: "Ngôn Tình",    input: BASE_URL + "/the-loai/ngon-tinh",    script: "gen.js" },
        { title: "Đô Thị",       input: BASE_URL + "/the-loai/do-thi",       script: "gen.js" },
        { title: "Huyền Huyễn",  input: BASE_URL + "/the-loai/huyen-huyen",  script: "gen.js" },
        { title: "Võng Du",      input: BASE_URL + "/the-loai/vong-du",      script: "gen.js" },
        { title: "Khoa Huyễn",   input: BASE_URL + "/the-loai/khoa-huyen",   script: "gen.js" },
        { title: "Hệ Thống",     input: BASE_URL + "/the-loai/he-thong",     script: "gen.js" },
        { title: "Dị Giới",      input: BASE_URL + "/the-loai/di-gioi",      script: "gen.js" },
        { title: "Lịch Sử",      input: BASE_URL + "/the-loai/lich-su",      script: "gen.js" },
        { title: "Quân Sự",      input: BASE_URL + "/the-loai/quan-su",      script: "gen.js" },
        { title: "Trinh Thám",   input: BASE_URL + "/the-loai/trinh-tham",   script: "gen.js" },
        { title: "Thám Hiểm",    input: BASE_URL + "/the-loai/tham-hiem",    script: "gen.js" },
        { title: "Linh Dị",      input: BASE_URL + "/the-loai/linh-di",      script: "gen.js" },
        { title: "Mạt Thế",      input: BASE_URL + "/the-loai/mat-the",      script: "gen.js" },
        { title: "Xuyên Nhanh",  input: BASE_URL + "/the-loai/xuyen-nhanh",  script: "gen.js" },
        { title: "Nữ Cường",     input: BASE_URL + "/the-loai/nu-cuong",     script: "gen.js" },
        { title: "Cung Đấu",     input: BASE_URL + "/the-loai/cung-dau",     script: "gen.js" },
        { title: "Đam Mỹ",       input: BASE_URL + "/the-loai/dam-my",       script: "gen.js" },
        { title: "Bách Hợp",     input: BASE_URL + "/the-loai/bach-hop",     script: "gen.js" }
    ]);
}
