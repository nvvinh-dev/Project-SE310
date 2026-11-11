using NhaTre.Application.DTOs.Dashboard;
using NhaTre.Application.DTOs.Tuition;

namespace NhaTre.Application.Interfaces;

public interface IDashboardService
{
    Task<ChildStatisticsResponse> GetChildStatisticsAsync();
    Task<AttendanceStatisticsResponse> GetAttendanceStatisticsAsync();
    Task<RevenueReportResponse> GetRevenueStatisticsAsync();
}
