function execute() {
    return Response.success([
        {title: "Mới cập nhật", input: "/danh-sach?sort=updated", script: "gen.js"},
        {title: "Hot", input: "/danh-sach?sort=views", script: "gen.js"},
        {title: "Truyện Nam", input: "/danh-sach?gender=nam", script: "gen.js"},
        {title: "Truyện Nữ", input: "/danh-sach?gender=nu", script: "gen.js"}
    ]);
}
