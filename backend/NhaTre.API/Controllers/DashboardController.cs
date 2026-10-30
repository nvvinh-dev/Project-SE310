using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NhaTre.Application.Common;
using NhaTre.Application.DTOs.Dashboard;
using NhaTre.Application.Interfaces;
using NhaTre.Domain.Constants;

namespace NhaTre.API.Controllers;

// FR-DASH-01..04: chỉ Admin xem, vai trò khác → 403 (BR-DASHBOARD-01, AC-DASH-05). Mỗi thống kê một
// action, chỉ đọc và không nhận tham số: kỳ thống kê luôn là hiện tại (D39 mục 12), nên không có validator
[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = Roles.Admin)]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    // FR-DASH-02: tổng số trẻ và số trẻ tách theo 3 lớp (AC-DASH-02)
    [HttpGet("child-statistics")]
    public async Task<ActionResult<ApiResponse<ChildStatisticsResponse>>> GetChildStatistics()
    {
        var result = await _dashboardService.GetChildStatisticsAsync();
        return Ok(ApiResponse<ChildStatisticsResponse>.Ok(result));
    }
}
