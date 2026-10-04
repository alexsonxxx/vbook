// LilyHub - trang chủ (danh sách tab)
// Chỉ hiện truyện đã có chương: truyện "sắp ra mắt" (chapter_count = 0) mở ra không đọc được.
function execute() {
    return Response.success([
        { title: "Truyện mới", input: "latest", script: "gen.js" },
        { title: "Hoàn thành", input: "completed", script: "gen.js" },
        { title: "Đang cập nhật", input: "ongoing", script: "gen.js" },
        { title: "Bách Hợp", input: "cat:Bách Hợp", script: "gen.js" },
        { title: "Nhiều chương nhất", input: "most-chapters", script: "gen.js" }
    ]);
}