# Hệ thống quản lý nhà trẻ — SE310

Ứng dụng web quản lý hoạt động hằng ngày của nhà trẻ cho 5 vai trò: Admin/Ban giám hiệu, Giáo
viên, Kế toán/Văn phòng, Y tế và Phụ huynh. Gồm hồ sơ trẻ, lớp học, điểm danh, theo dõi sức
khỏe, học phí và thông báo cho phụ huynh.

Backend là ASP.NET Core Web API dựng theo kiến trúc 4 lớp, frontend là Next.js.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Backend | ASP.NET Core 10, EF Core 10, FluentValidation, Serilog |
| Cơ sở dữ liệu | PostgreSQL (đang dùng Supabase) |
| Xác thực | JWT Bearer, thuật toán HS256 |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Gọi API | Axios, TanStack Query, React Hook Form |

## Yêu cầu môi trường

- .NET SDK 10
- Node.js 20.9 trở lên
- Một cơ sở dữ liệu PostgreSQL
- Công cụ `dotnet-ef` để chạy migration:

```
dotnet tool install --global dotnet-ef
```

## Cấu hình

Chuỗi kết nối và khóa JWT không nằm trong repo. Mỗi người tự khai báo bằng user-secrets,
chạy trong thư mục `backend/NhaTre.API`:

```
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=...;Port=5432;Database=...;Username=...;Password=..."
dotnet user-secrets set "Jwt:Key" "<chuỗi ngẫu nhiên tối thiểu 32 ký tự>"
```

Xin chuỗi kết nối từ nhóm trưởng. Không đưa hai giá trị này vào bất kỳ file nào trong repo.

Phía frontend, sao chép `frontend/.env.example` thành `frontend/.env.local`. Giá trị mặc
định đã trỏ về `http://localhost:5015`, chỉ sửa nếu bạn đổi cổng backend.

## Chạy dự án

Tạo hoặc cập nhật schema cơ sở dữ liệu:

```
dotnet ef database update --project backend/NhaTre.Infrastructure --startup-project backend/NhaTre.API
```

Chạy backend:

```
dotnet run --project backend/NhaTre.API
```

API chạy ở `http://localhost:5015`, tài liệu Swagger ở `http://localhost:5015/swagger`.
Log ghi ra console và thư mục `Logs/`, tách theo ngày, giữ lại 14 ngày gần nhất.

Chạy frontend:

```
cd frontend
npm install
npm run dev
```

Giao diện ở `http://localhost:3000`.

Backend chỉ chấp nhận request từ các origin khai báo ở `Cors:AllowedOrigins` trong
`appsettings.json`, mặc định là `http://localhost:3000`. Nếu bạn chạy frontend ở cổng
khác thì phải bổ sung vào đây, không thì trình duyệt sẽ chặn.

## Cấu trúc thư mục

```
backend/
  NhaTre.Domain/          Entity và hằng số. Không tham chiếu project nào khác.
  NhaTre.Application/     DTO, interface, service, validator.
  NhaTre.Infrastructure/  DbContext, cấu hình Fluent API, migration, repository.
  NhaTre.API/             Controller, middleware, cấu hình khởi động.
frontend/
  src/app/                Route theo App Router.
  src/context/            AuthContext, quản lý phiên đăng nhập.
  src/lib/                Axios instance đã gắn sẵn interceptor.
  src/types/              Kiểu dữ liệu dùng chung.
```

Phụ thuộc đi một chiều: API phụ thuộc Application, Infrastructure phụ thuộc Application,
Application phụ thuộc Domain. Domain không tham chiếu ngược lên lớp nào.

## API hiện có

| Phương thức | Đường dẫn | Vai trò | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Không cần đăng nhập | Đăng nhập, trả về token JWT |
| GET | `/api/auth/me` | Mọi vai trò | Thông tin người đang đăng nhập |
| GET | `/api/children` | Kế toán | Danh sách hồ sơ trẻ |
| GET | `/api/children/{id}` | Kế toán | Chi tiết một hồ sơ trẻ |
| POST | `/api/children` | Kế toán | Tạo hồ sơ nhập học |
| PUT | `/api/children/{id}` | Kế toán | Sửa hồ sơ nhập học |

Mọi response đều theo chung một khuôn, kể cả khi lỗi:

```json
{ "success": true, "data": { }, "message": null, "errors": null }
```

Endpoint đăng nhập bị giới hạn 5 lần gọi mỗi phút cho mỗi địa chỉ IP. Vượt quá sẽ nhận
mã 429, chờ hết phút đó rồi thử lại.

## Quy trình làm việc

- `develop` là nhánh tích hợp và là nhánh mặc định. Không commit thẳng lên `develop`: mỗi việc
  làm trên một nhánh `feature/<tên-việc>` rồi mở pull request vào `develop`. Không ai tự mở
  pull request vào `main`.
- Pull request phải được người review trong `.github/CODEOWNERS` duyệt: backend do Vinh hoặc
  Đức, frontend do Giang hoặc Kiệt. Không tự duyệt PR của mình; người còn lại duyệt. Mô tả
  pull request ghi rõ làm gì, thêm endpoint nào, mã FR tương ứng và đã test thế nào.
- Chỉ merge bằng merge commit. Không xóa nhánh sau khi merge.
- Commit theo Conventional Commits, mô tả bằng tiếng Việt, ví dụ `feat(auth): thêm đăng nhập`.
- Không commit secret (connection string, khóa ký JWT, service key của Supabase). Backend đọc
  secret qua `dotnet user-secrets`, frontend qua `.env.local`.

## Tài liệu

Tài liệu đặc tả yêu cầu, quy tắc nghiệp vụ, thiết kế cơ sở dữ liệu, hướng dẫn onboarding
và nhật ký quyết định nằm ở repo private `Project-SE310-docs`, nhóm trưởng cấp quyền cho từng
thành viên. Clone repo đó vào thư mục `docs/` của dự án (repo này đã bỏ qua thư mục `docs/`):

```
git clone https://github.com/nvvinh-dev/Project-SE310-docs.git docs
```

Khi nhóm trưởng báo có cập nhật tài liệu, chạy `git -C docs pull`.

Trong mã nguồn có những chú thích dạng `D20`, `D38`, `D39` — đó là số hiệu quyết định,
tra trong `docs/DECISIONS.md`.

## Thành viên

| Thành viên | GitHub |
| :-- | :-- |
| Vinh (nhóm trưởng) | [@nvvinh-dev](https://github.com/nvvinh-dev) |
| Giang | [@QuangGiang06](https://github.com/QuangGiang06) |
| Đức | [@broccoli2609](https://github.com/broccoli2609) |
| Kiệt | [@Ender-Via](https://github.com/Ender-Via) |
