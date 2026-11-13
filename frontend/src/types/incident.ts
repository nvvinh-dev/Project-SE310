export interface IncidentPhotoResponse {
  id: string;
  url: string;
}

export interface IncidentResponse {
  id: string;
  childId: string;
  childFullName: string;
  occurredAtUtc: string;
  description: string;
  photos: IncidentPhotoResponse[];
}

export interface CreateIncidentRequest {
  childId: string;
  occurredAtUtc: string;
  description: string;
}

// FR-INCIDENT-03: Danh sách sự cố tóm tắt cho phụ huynh xem
export interface ChildIncidentSummaryResponse {
  id: string;
  occurredAtUtc: string;
  description: string;
  photoCount: number;
}

// FR-INCIDENT-03: Chi tiết sự cố cho phụ huynh xem kèm URL ảnh ký 60 phút
export interface ChildIncidentResponse {
  id: string;
  occurredAtUtc: string;
  description: string;
  photos: IncidentPhotoResponse[];
}
