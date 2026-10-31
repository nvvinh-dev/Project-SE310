using Microsoft.EntityFrameworkCore;
using NhaTre.Application.DTOs.Dashboard;
using NhaTre.Application.Interfaces;
using NhaTre.Domain.Constants;

namespace NhaTre.Infrastructure.Persistence.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly AppDbContext _dbContext;

    public DashboardRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // Đếm ngay trong database, không tải hồ sơ trẻ về
    public async Task<IReadOnlyList<ClassChildCountResponse>> GetClassChildCountsAsync()
    {
        return await _dbContext.Classes
            .AsNoTracking()
            .OrderBy(c => c.MinAgeMonths)
            .Select(c => new ClassChildCountResponse(c.Name, c.Children.Count()))
            .ToListAsync();
    }

    // Lớp lấy theo children.class_id hiện tại: attendances không lưu lớp lúc điểm danh, nên trẻ chuyển
    // lớp được tính cho lớp mới, trẻ đã gỡ khỏi lớp không tính. Đếm ngay trong database
    public async Task<IReadOnlyList<ClassAttendanceCount>> GetClassAttendanceCountsAsync(
        DateOnly fromDate, DateOnly toDateExclusive)
    {
        return await _dbContext.Classes
            .AsNoTracking()
            .OrderBy(c => c.MinAgeMonths)
            .Select(c => new
            {
                c.Name,
                Attendances = c.Children
                    .SelectMany(child => child.Attendances)
                    .Where(a => a.AttendanceDate >= fromDate && a.AttendanceDate < toDateExclusive),
            })
            .Select(c => new ClassAttendanceCount(
                c.Name,
                c.Attendances.Count(a => a.Status == AttendanceStatuses.Present),
                c.Attendances.Count()))
            .ToListAsync();
    }
}
