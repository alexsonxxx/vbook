// LilyHub - thể loại / sắp xếp
// (không có tab "Sắp ra mắt": những truyện đó chưa có chương nên không đọc được)
function execute() {
    return Response.success([
        { title: "Tất cả", input: "latest", script: "gen.js" },
        { title: "Hoàn thành", input: "completed", script: "gen.js" },
        { title: "Đang cập nhật", input: "ongoing", script: "gen.js" },
        { title: "Bách Hợp", input: "cat:Bách Hợp", script: "gen.js" },
        { title: "Nhiều chương nhất", input: "most-chapters", script: "gen.js" },
        { title: "Được yêu thích nhất", input: "most-votes", script: "gen.js" },
        { title: "Xem nhiều nhất", input: "most-views", script: "gen.js" },
        { title: "Mới cập nhật", input: "recently-updated", script: "gen.js" }
    ]);
}