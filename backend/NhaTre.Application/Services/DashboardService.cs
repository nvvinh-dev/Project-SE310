using NhaTre.Application.Common;
using NhaTre.Application.DTOs.Dashboard;
using NhaTre.Application.Interfaces;

namespace NhaTre.Application.Services;

// FR-DASH: Admin xem số liệu tổng hợp toàn trường (BR-DASHBOARD-01/02/03). Chỉ đọc, không ghi
// security_events (D50)
public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    // FR-DASH-02: số trẻ là số hiện tại, không có lịch sử phân lớp để tính theo tháng. Tổng lấy bằng
    // cách cộng 3 lớp, để luôn khớp với các số tách theo lớp
    public async Task<ChildStatisticsResponse> GetChildStatisticsAsync()
    {
        var classes = await _dashboardRepository.GetClassChildCountsAsync();
        return new ChildStatisticsResponse(classes.Sum(c => c.ChildCount), classes);
    }

    // FR-DASH-03, D39 mục 12: tháng hiện tại theo giờ Việt Nam, cùng cách attendance_date được đặt (D23).
    // Chỉ bản ghi Present là có mặt (AC-DASH-03); số toàn trường cộng từ 3 lớp như FR-DASH-02
    public async Task<AttendanceStatisticsResponse> GetAttendanceStatisticsAsync()
    {
        var today = VietnamTime.DateOf(DateTime.UtcNow);
        var monthStart = new DateOnly(today.Year, today.Month, 1);

        var counts = await _dashboardRepository.GetClassAttendanceCountsAsync(monthStart, monthStart.AddMonths(1));
        var classes = counts
            .Select(c => new ClassAttendanceStatisticsResponse(
                c.ClassName, c.PresentCount, c.RecordCount, PresentRate(c.PresentCount, c.RecordCount)))
            .ToList();

        var presentCount = classes.Sum(c => c.PresentCount);
        var recordCount = classes.Sum(c => c.RecordCount);
        return new AttendanceStatisticsResponse(monthStart.Year, monthStart.Month, presentCount, recordCount,
            PresentRate(presentCount, recordCount), classes);
    }

    // Chưa có bản ghi thì không có tỷ lệ, để giao diện hiện "—" thay vì 0% (ui-screens.md SCR-ADM-01)
    private static double? PresentRate(int presentCount, int recordCount)
        => recordCount == 0 ? null : (double)presentCount / recordCount;
}
