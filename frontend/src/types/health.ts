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

// Tâm trạng: 4 giá trị theo D39 mục 1 & HealthMoods.cs
export const HEALTH_MOODS = ["Happy", "Normal", "Tired", "Fussy"] as const;
export type HealthMood = (typeof HEALTH_MOODS)[number];

export function isHealthMood(value: string): value is HealthMood {
  return HEALTH_MOODS.some((mood) => mood === value);
}

export const HEALTH_MOOD_LABELS: Record<HealthMood, string> = {
  Happy: "Vui vẻ",
  Normal: "Bình thường",
  Tired: "Mệt",
  Fussy: "Quấy khóc",
};

export const HEALTH_MOOD_OPTIONS = HEALTH_MOODS.map((mood) => ({
  value: mood,
  label: HEALTH_MOOD_LABELS[mood],
}));

export interface QuickHealthStatusRequest {
  childId: string;
  mood: HealthMood;
  temperatureCelsius: number | null;
  notes: string;
}

export interface QuickHealthStatusResponse {
  id: string;
  childId: string;
  childFullName: string;
  recordedAtUtc: string;
  mood: HealthMood;
  temperatureCelsius: number | null;
  notes: string;
}

// Lịch sử gộp Y tế xem (FR-HEALTH-04, D39 mục 9)
export type HealthHistoryItemType = "Incident" | "QuickHealthStatus" | "GrowthMeasurement";

export interface BaseHealthHistoryItem {
  id: string;
  type: HealthHistoryItemType;
  occurredAtUtc: string;
}

export interface IncidentHistoryItemResponse extends BaseHealthHistoryItem {
  type: "Incident";
  description: string;
}

export interface QuickHealthStatusHistoryItemResponse extends BaseHealthHistoryItem {
  type: "QuickHealthStatus";
  mood: HealthMood;
  temperatureCelsius: number | null;
  notes: string;
}

export interface GrowthMeasurementHistoryItemResponse extends BaseHealthHistoryItem {
  type: "GrowthMeasurement";
  heightCm: number | null;
  weightKg: number | null;
}

export type HealthHistoryItemResponse =
  | IncidentHistoryItemResponse
  | QuickHealthStatusHistoryItemResponse
  | GrowthMeasurementHistoryItemResponse;

export interface HealthHistoryResponse {
  child: SchoolChildResponse;
  items: HealthHistoryItemResponse[];
}
