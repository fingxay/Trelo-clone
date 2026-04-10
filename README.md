# Trello Clone

Ứng dụng quản lý công việc theo phong cách Trello, xây bằng **React + Vite + Tailwind CSS**. Dự án hiện chạy hoàn toàn ở frontend, dùng `localStorage` để lưu dữ liệu board, list và card ngay trên trình duyệt.

## Giới thiệu

Dự án này được làm để mô phỏng lại trải nghiệm quản lý công việc kiểu Trello và luyện các phần quan trọng ở phía frontend như:

- quản lý state lồng nhau trong React
- xử lý luồng dữ liệu giữa board, list, card
- xây dựng UI tương tác với modal, menu và panel lưu trữ
- lưu và khôi phục dữ liệu cục bộ bằng `localStorage`

## Tính năng hiện có

### Quản lý board

- Hiển thị danh sách board ở màn hình tổng quan
- Tạo board mới
- Mở từng board để thao tác chi tiết
- Đổi tên board trực tiếp trên header
- Lưu trữ board
- Khôi phục hoặc xóa vĩnh viễn board đã lưu trữ

### Quản lý list

- Thêm list mới trong board
- Đổi tên list inline
- Kéo thả để đổi vị trí list
- Sao chép list
- Di chuyển list sang vị trí khác
- Đổi màu nền list
- Lưu trữ list
- Khôi phục hoặc xóa list đã lưu trữ
- Di chuyển toàn bộ card trong một list sang list khác
- Lưu trữ toàn bộ card trong một list

### Quản lý card

- Thêm card vào từng list
- Kéo thả card giữa các list hoặc trong cùng list
- Mở modal để xem và chỉnh sửa chi tiết card
- Đổi tiêu đề card
- Cập nhật mô tả
- Gắn nhãn màu và chỉnh tên nhãn
- Thêm ngày bắt đầu và hạn hoàn thành
- Thêm checklist, đổi tên checklist, thêm item và đánh dấu hoàn thành
- Lưu trữ card
- Khôi phục hoặc xóa card đã lưu trữ

### Lưu trữ dữ liệu

- Danh sách board được lưu trong `localStorage`
- Dữ liệu chi tiết từng board được lưu riêng theo `boardId`
- Có cơ chế chuẩn hóa dữ liệu khi đọc lại để tránh lỗi khi dữ liệu thiếu field

## Công nghệ sử dụng

- React
- Vite
- Tailwind CSS
- lucide-react
- ESLint

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js 18 trở lên
- npm

### Chạy ở môi trường local

```bash
npm install
npm run dev
```

Ứng dụng thường chạy tại:

```text
http://localhost:5173
```

### Build production

```bash
npm run build
```

### Kiểm tra lint

```bash
npm run lint
```

### Xem bản build local

```bash
npm run preview
```

## Cấu trúc thư mục chính

```text
src/
├─ components/
│  ├─ Board.jsx
│  ├─ BoardList.jsx
│  ├─ board/
│  │  ├─ AddListBox.jsx
│  │  ├─ ArchivedBoardsPanel.jsx
│  │  ├─ ArchivedItemsPanel.jsx
│  │  └─ BoardHeader.jsx
│  ├─ card/
│  │  ├─ CardChecklistSection.jsx
│  │  ├─ CardDatePopover.jsx
│  │  ├─ CardModal.jsx
│  │  └─ labelOptions.js
│  ├─ common/
│  │  └─ ConfirmModal.jsx
│  └─ list/
│     ├─ AddCard.jsx
│     ├─ Card.jsx
│     ├─ CopyListView.jsx
│     ├─ List.jsx
│     └─ ListMenu.jsx
├─ data/
│  └─ mockBoard.js
├─ utils/
│  ├─ boardCardData.js
│  └─ boardData.js
├─ App.jsx
├─ index.css
└─ main.jsx
```

## Luồng dữ liệu chính

- `src/App.jsx`: quản lý danh sách board, board đang chọn và archived boards
- `src/components/Board.jsx`: quản lý chi tiết một board, bao gồm list, card, modal, archive và drag/drop
- `src/utils/boardData.js`: chuẩn hóa dữ liệu board/card khi đọc từ storage
- `src/utils/boardCardData.js`: hỗ trợ tạo card mới, copy card và chuẩn hóa cập nhật card

## Cơ chế lưu dữ liệu

Dự án không dùng backend hoặc database. Dữ liệu hiện được lưu trực tiếp trong trình duyệt bằng các key như:

- `trello-clone-boards`
- `trello-clone-archived-boards`
- `trello-clone-board-{boardId}`

Nếu xóa dữ liệu trình duyệt hoặc đổi trình duyệt hay thiết bị, dữ liệu sẽ không còn.

## Giao diện và UX hiện tại

- Giao diện dark theme theo phong cách Trello
- Có modal xác nhận cho các thao tác xóa quan trọng
- Có panel riêng cho các item đã lưu trữ
- Có xử lý `Escape`, click ra ngoài và focus input ở nhiều luồng thao tác

## Giới hạn hiện tại

- Chưa có backend
- Chưa có đăng nhập hoặc phân quyền người dùng
- Chưa có realtime collaboration
- Chưa có đồng bộ nhiều thiết bị
- Dữ liệu ban đầu vẫn là mock data
- Dự án hiện tập trung vào frontend SPA và local state

## Hướng phát triển tiếp theo

- Kết nối backend để đồng bộ board, list và card
- Thêm authentication và quản lý workspace
- Bổ sung comment thật, activity log thật và upload file
- Thêm filter, search và members
- Cải thiện drag/drop bằng thư viện chuyên dụng
- Viết test cho utility và các luồng cập nhật state quan trọng

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Ghi chú

README này mô tả theo trạng thái hiện tại của dự án. Nếu sau này thay đổi cấu trúc thư mục, logic lưu dữ liệu hoặc thêm backend hay auth thì nên cập nhật lại README cùng lúc với code.