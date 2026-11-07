import type { IncidentResponse } from "@/types/incident";

// Dữ liệu giả sự cố trong thời gian chờ backend hoàn thiện FR-INCIDENT-03
// Tuân thủ quy định docs/testing/testing-strategy.md §3.2 & docs/onboarding/team-workflow.md §10
export const MOCK_CHILD_INCIDENTS: IncidentResponse[] = [
  {
    id: "f1a2b3c4-d5e6-47a8-b9c0-112233445566",
    childId: "",
    childFullName: "",
    occurredAtUtc: "2026-10-16T03:15:00Z", // 10:15 giờ Việt Nam
    description: "Ngã ở sân chơi, trầy đầu gối, đã sát trùng.",
    photos: [
      {
        id: "p1111111-1111-4111-8111-111111111111",
        url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=60",
      },
      {
        id: "p2222222-2222-4222-8222-222222222222",
        url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60",
      },
    ],
  },
];
