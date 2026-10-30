export interface IDoctor {
  id: string;
  full_name: string;
  specialty: string;
  hospital_name: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  available: boolean;
  created_at: string;
}
