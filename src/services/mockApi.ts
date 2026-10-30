import type { IMedication, IReport, IHealthMetric, IMessage } from '../models';

// Mock Delay Helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- MEDICATIONS ---
export const fetchMedications = async (): Promise<IMedication[]> => {
  await delay(500);
  return [
    { id: 1, name: 'Vitamin D3', dosage: '1000 IU', time: '08:00 AM', type: 'supplement', afterMeal: true },
    { id: 2, name: 'Amoxicillin', dosage: '500 mg', time: '02:00 PM', type: 'antibiotic', afterMeal: true },
    { id: 3, name: 'Melatonin', dosage: '5 mg', time: '10:00 PM', type: 'supplement', afterMeal: false },
  ] as any;
};

export const saveMedication = async (med: Partial<IMedication>): Promise<IMedication> => {
  await delay(600);
  return { ...med, id: Date.now() } as IMedication;
};

export const deleteMedication = async (id: number): Promise<void> => {
  await delay(400);
  console.log('Deleted medication:', id);
};

// --- REPORTS ---
export const fetchReports = async (): Promise<IReport[]> => {
  await delay(500);
  return [
    { id: 1, name: 'Annual Blood Test Results', date: 'Oct 24, 2023', type: 'PDF', size: '2.4 MB', status: 'Analyzed' },
    { id: 2, name: 'Chest X-Ray Imaging', date: 'Sep 12, 2023', type: 'JPG', size: '5.1 MB', status: 'Pending' },
    { id: 3, name: 'Cardiology Assessment', date: 'Jul 05, 2023', type: 'PDF', size: '1.2 MB', status: 'Analyzed' },
  ];
};

export const uploadReport = async (file: File): Promise<IReport> => {
  await delay(2000); // simulate upload
  return {
    id: Date.now(),
    name: file.name,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    status: 'Pending'
  };
};

// --- HEALTH TRACKER ---
export const fetchWeightData = async (): Promise<IHealthMetric[]> => {
  await delay(300);
  return [
    { name: 'Mon', weight: 75 },
    { name: 'Tue', weight: 74.8 },
    { name: 'Wed', weight: 74.5 },
    { name: 'Thu', weight: 74.6 },
    { name: 'Fri', weight: 74.2 },
    { name: 'Sat', weight: 74.0 },
    { name: 'Sun', weight: 73.8 },
  ];
};

export const addWeightLog = async (weight: number, day: string): Promise<IHealthMetric> => {
  await delay(500);
  return { name: day, weight };
};

// --- AI ASSISTANT ---
export const sendAiQuery = async (query: string): Promise<IMessage> => {
  await delay(1200);
  
  const lowerQuery = query.toLowerCase();
  let text = "I'm a mock AI assistant. I didn't quite catch that. Try asking about your sleep, blood test, or a workout routine!";
  
  if (lowerQuery.includes("sleep")) {
    text = "Based on your recent data, your sleep quality has been inconsistent. Aim for 7-9 hours of continuous rest. Setting a consistent bedtime can help regulate your circadian rhythm.";
  } else if (lowerQuery.includes("blood pressure") || lowerQuery.includes("eat")) {
    text = "To help lower blood pressure, consider the DASH diet: increase intake of fruits, vegetables, and whole grains, and reduce sodium to under 2,300mg a day.";
  } else if (lowerQuery.includes("blood test")) {
    text = "Your latest Annual Blood Test from Oct 24 shows all parameters are normal, except Vitamin D is slightly low. A daily supplement of 1000 IU is recommended.";
  } else if (lowerQuery.includes("workout")) {
    text = "For this week, I suggest 3 days of 30-minute moderate cardio (like brisk walking or cycling) and 2 days of light strength training. Remember to warm up!";
  }
  
  return {
    id: Date.now().toString(),
    text,
    sender: 'ai'
  };
};
