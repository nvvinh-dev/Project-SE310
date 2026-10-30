using NhaTre.Application.DTOs.Dashboard;

namespace NhaTre.Application.Interfaces;

// Dashboard không có bảng riêng: mọi method chỉ đọc và tính trên bảng của module khác
// (database-design.md §2)
public interface IDashboardRepository
{
    // Số trẻ của từng lớp, xếp theo nhóm tuổi: Mầm, Chồi, Lá
    Task<IReadOnlyList<ClassChildCountResponse>> GetClassChildCountsAsync();
}
