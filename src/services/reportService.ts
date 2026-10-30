import { supabase } from '../lib/supabase';
import { analyzeMedicalReport as askGeminiForAnalysis } from './geminiService';

export async function saveMedicalReport(fileName: string, analysisText: string) {
  console.log("STEP: Fetching auth user for DB insert");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");

  const payload = {
    user_id: user.id,
    report_name: fileName,
    ai_analysis: analysisText,
    uploaded_at: new Date().toISOString(),
  };

  console.log("STEP: Inserting into health_reports", payload);
  const { data: report, error } = await supabase
    .from("health_reports")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("ERROR INSERTING REPORT:", error);
    throw error;
  }
  return report;
}

export async function analyzeReportContent(file: File) {
  console.log("STEP: Generating Gemini Analysis");
  
  let reportText = "";
  try {
    reportText = await file.text();
  } catch (e) {
    reportText = `Medical report uploaded. Filename: ${file.name}`;
  }

  const analysis = await askGeminiForAnalysis(reportText.substring(0, 15000));
  return analysis;
}

export async function loadUserReports() {
  console.log("STEP: Fetching auth user for loading reports");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("User not authenticated");

  console.log("STEP: Fetching health_reports");
  const { data, error } = await supabase
    .from("health_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("ERROR:", error);
    throw error;
  }
  
  return data;
}
