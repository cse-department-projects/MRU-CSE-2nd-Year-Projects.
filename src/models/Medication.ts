export interface IMedication {
  id: number;
  user_id: string;
  name: string;
  dosage: string;
  frequency: number;
  morning_time?: string;
  afternoon_time?: string;
  evening_time?: string;
  taken_morning: boolean;
  taken_afternoon: boolean;
  taken_evening: boolean;
  last_reset_date?: string;
  notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}
