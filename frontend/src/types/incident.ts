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
