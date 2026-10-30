namespace NhaTre.Application.DTOs.Dashboard;

// FR-DASH-02: chỉ số liệu tổng hợp, không id hay tên trẻ (D45, BR-DASHBOARD-03, AC-DASH-06).
// TotalChildren là tổng số trẻ của 3 lớp: trẻ nghỉ học bị gỡ khỏi lớp (D39 mục 2) nên không tính
public record ChildStatisticsResponse(
    int TotalChildren,
    IReadOnlyList<ClassChildCountResponse> Classes);

// Lớp chưa có trẻ vẫn có mặt với ChildCount = 0
public record ClassChildCountResponse(string ClassName, int ChildCount);
