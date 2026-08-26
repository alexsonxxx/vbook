// genre.js — YouTube categories as curated search topics (YouTube has no
// server-rendered genre index; each entry opens a search listing).
function execute() {
    return Response.success([
        { title: "Trực tiếp", input: "live:trực tiếp", script: "search.js" },
        { title: "Âm nhạc", input: "music", script: "search.js" },
        { title: "Game", input: "gaming", script: "search.js" },
        { title: "Phim & Hoạt hình", input: "movie", script: "search.js" },
        { title: "Tin tức", input: "news", script: "search.js" },
        { title: "Thể thao", input: "sports", script: "search.js" },
        { title: "Công nghệ", input: "technology", script: "search.js" },
        { title: "Giáo dục", input: "education", script: "search.js" },
        { title: "Ẩm thực", input: "cooking", script: "search.js" },
        { title: "Du lịch", input: "travel", script: "search.js" },
        { title: "Vlog", input: "vlog", script: "search.js" }
    ]);
}
