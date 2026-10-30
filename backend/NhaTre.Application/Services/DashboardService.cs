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
}
