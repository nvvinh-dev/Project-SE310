using NhaTre.Application.DTOs.Dashboard;

namespace NhaTre.Application.Interfaces;

public interface IDashboardService
{
    Task<ChildStatisticsResponse> GetChildStatisticsAsync();
    Task<AttendanceStatisticsResponse> GetAttendanceStatisticsAsync();
}
