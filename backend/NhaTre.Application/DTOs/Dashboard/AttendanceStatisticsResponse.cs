namespace NhaTre.Application.DTOs.Dashboard;

// FR-DASH-03: tỷ lệ có mặt của tháng hiện tại theo giờ Việt Nam, tách theo lớp (D39 mục 12). Chỉ số liệu
// tổng hợp, không id hay tên trẻ (D45, BR-DASHBOARD-03, AC-DASH-06). Số toàn trường cộng từ 3 lớp, cùng
// cách tính tổng với FR-DASH-02
public record AttendanceStatisticsResponse(
    int Year,
    int Month,
    int PresentCount,
    int RecordCount,
    double? PresentRate,
    IReadOnlyList<ClassAttendanceStatisticsResponse> Classes);

// PresentRate = PresentCount / RecordCount, từ 0 tới 1; null khi chưa có bản ghi nào trong tháng.
// Ngày không điểm danh thì không có bản ghi nên không tính là vắng (D23)
public record ClassAttendanceStatisticsResponse(
    string ClassName,
    int PresentCount,
    int RecordCount,
    double? PresentRate);

// Số đếm thô của một lớp do Repository trả, Service tính tỷ lệ từ đây
public record ClassAttendanceCount(string ClassName, int PresentCount, int RecordCount);
