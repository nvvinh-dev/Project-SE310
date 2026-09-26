# Hệ thống quản lý nhà trẻ — SE310

Web quản lý nhà trẻ cho 5 vai trò: Admin/Ban giám hiệu, Giáo viên, Kế toán/Văn phòng, Y tế và
Phụ huynh.

## Công nghệ

- Backend: ASP.NET Core Web API, Entity Framework Core
- Frontend: Next.js (TypeScript)
- Database: PostgreSQL trên Supabase

## Cấu trúc

- `backend/` — mã nguồn API
- `frontend/` — mã nguồn web

## Quy trình làm việc

- `develop` là nhánh tích hợp và là nhánh mặc định. Không commit thẳng lên `develop`: mỗi việc
  làm trên một nhánh `feature/<tên-việc>` rồi mở pull request vào `develop`.
- Pull request phải được người review trong `.github/CODEOWNERS` duyệt: backend do Vinh hoặc
  Đức, frontend do Giang hoặc Kiệt. Không tự duyệt PR của mình; người còn lại duyệt.
- Chỉ merge bằng merge commit. Không xóa nhánh sau khi merge.
- Commit theo Conventional Commits, mô tả bằng tiếng Việt, ví dụ `feat(auth): thêm đăng nhập`.
- Không commit secret (connection string, khóa ký JWT, service key của Supabase). Backend đọc
  secret qua `dotnet user-secrets`, frontend qua `.env.local`.

## Thành viên

| Thành viên | GitHub |
| :-- | :-- |
| Vinh (nhóm trưởng) | [@nvvinh-dev](https://github.com/nvvinh-dev) |
| Giang | [@QuangGiang06](https://github.com/QuangGiang06) |
| Đức | [@broccoli2609](https://github.com/broccoli2609) |
| Kiệt | [@Ender-Via](https://github.com/Ender-Via) |
