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
export type HealthMood = "Happy" | "Normal" | "Tired" | "Fussy";

export const HEALTH_MOOD_LABELS: Record<HealthMood, string> = {
  Happy: "Vui vẻ",
  Normal: "Bình thường",
  Tired: "Mệt",
  Fussy: "Quấy khóc",
};

export const HEALTH_MOODS = Object.keys(HEALTH_MOOD_LABELS) as HealthMood[];

export function isHealthMood(value: string): value is HealthMood {
  return (HEALTH_MOODS as string[]).includes(value);
}

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
