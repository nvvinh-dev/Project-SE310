export interface SchoolChildResponse {
  id: string;
  fullName: string;
  dateOfBirth: string;
  healthNotes: string | null;
}

export interface GrowthMeasurementResponse {
  id: string;
  childId: string;
  measuredAtUtc: string;
  heightCm: number | null;
  weightKg: number | null;
}

export interface GrowthMeasurementRequest {
  heightCm: number | null;
  weightKg: number | null;
}

export interface GrowthMeasurementFormValues {
  heightCm: string;
  weightKg: string;
}
