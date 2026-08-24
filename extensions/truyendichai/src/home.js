var BASE_URL = "https://truyendich.fit";

function execute() {
    return Response.success([
        { title: "Truyện Hot",    input: BASE_URL + "/danh-sach/truyen-hot",      script: "gen.js" },
        { title: "Truyện Mới",    input: BASE_URL + "/danh-sach/truyen-moi",      script: "gen.js" },
        { title: "Truyện Full",   input: BASE_URL + "/danh-sach/truyen-full",     script: "gen.js" },
        { title: "Dịch AI",       input: BASE_URL + "/danh-sach/truyen-dich-ai",  script: "gen.js" },
        { title: "Thể Loại",      input: BASE_URL + "/kham-pha",                  script: "genre.js" }
    ]);
}
