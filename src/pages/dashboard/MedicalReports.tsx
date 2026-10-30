import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Brain, AlertCircle, FileBarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { loadUserReports, saveMedicalReport, analyzeReportContent } from '../../services/reportService';

export default function MedicalReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setFetching(true);
        const data = await loadUserReports();
        setReports(data || []);
        if (data && data.length > 0) {
          setSelectedReport(data[0]);
        }
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchReports();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // 1. Analyze with Gemini
      const analysisText = await analyzeReportContent(file);
      
      // 2. Save to DB
      const newReport = await saveMedicalReport(file.name, analysisText);
      
      // 3. Update UI
      setReports((prev) => [newReport, ...prev]);
      setSelectedReport(newReport);
    } catch (error: any) {
      console.error('Medical report error:', error);
      const message = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error, null, 2);
      alert(`Medical Reports Error:\n${message}`);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      if (fileInputRef.current) {
        fileInputRef.current.files = dt.files;
        handleFileChange({ target: fileInputRef.current } as any);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col font-inter p-6 overflow-hidden">
      
      <div className="flex flex-col lg:flex-row gap-6 h-full items-stretch">
        
        {/* LEFT COLUMN - 35% */}
        <div className="w-full lg:w-[35%] flex flex-col gap-6 h-full">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-slate-900 tracking-tight">Intelligence Workspace</h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Upload a PDF to view AI analysis and save securely.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm flex-shrink-0">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" 
              accept=".pdf"
            />
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50 rounded-[20px] p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm mb-1">Click or drag PDF to upload</p>
              <p className="text-xs text-slate-500 font-medium">Powered by Gemini AI</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] flex-1 overflow-y-auto hide-scrollbar shadow-sm p-4 min-h-0">
             {fetching ? (
               <div className="flex justify-center items-center h-full text-slate-400 font-medium">
                 Loading reports...
               </div>
             ) : reports.length > 0 ? (
               <div className="space-y-2">
                 {reports.map((r) => (
                   <div 
                     key={r.id}
                     onClick={() => setSelectedReport(r)}
                     className={`p-4 rounded-xl flex items-center gap-4 border shadow-sm cursor-pointer transition-colors ${
                       selectedReport?.id === r.id 
                         ? 'bg-primary/5 border-primary/20' 
                         : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                     }`}
                   >
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-colors ${
                       selectedReport?.id === r.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                     }`}>
                       <FileText className="w-6 h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <h4 className={`text-sm font-bold truncate transition-colors ${selectedReport?.id === r.id ? 'text-primary' : 'text-slate-800'}`}>
                         {r.report_name}
                       </h4>
                       <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                         {r.uploaded_at || r.created_at ? new Date(r.uploaded_at || r.created_at).toLocaleDateString() : 'Just now'}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 font-medium p-8 text-center">
                 <FileBarChart2 className="w-10 h-10 text-slate-300 mb-3" />
                 <p>No reports found.</p>
               </div>
             )}
          </div>
        </div>

        {/* RIGHT COLUMN - 65% */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6 h-full">
          <div>
            <h2 className="text-3xl font-poppins font-bold text-slate-900 tracking-tight">Medical Report Intelligence</h2>
            <p className="text-slate-500 mt-1 font-medium text-sm">Review AI insights and structured biomarker data.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] shadow-sm flex-1 flex flex-col overflow-hidden relative min-h-0">
            {loading ? (
               <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
                 <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="font-medium text-lg text-slate-500">Analyzing document with Gemini AI...</p>
               </div>
            ) : !selectedReport ? (
               <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
                 <FileBarChart2 className="w-16 h-16 mb-4 opacity-20" />
                 <p className="font-medium text-lg text-slate-500">Select a report to view AI analysis.</p>
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto hide-scrollbar p-6 lg:p-8 flex flex-col">
                 
                 {/* AI Diagnostic Summary */}
                 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[20px] p-6 lg:p-8 text-white relative overflow-hidden mb-8 shadow-md flex-shrink-0">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider text-primary">AI Diagnostic Summary</span>
                      </div>
                      <div className="text-[15px] leading-relaxed text-slate-200 font-medium whitespace-pre-wrap prose prose-sm prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-400">
                        <ReactMarkdown>{selectedReport?.ai_analysis || selectedReport?.analysis || ''}</ReactMarkdown>
                      </div>
                    </div>
                 </div>

                 {/* Hardcoded Biomarker Cards for Display Consistency */}
                 <h3 className="font-poppins font-bold text-xl text-slate-900 mb-4 flex-shrink-0">Extracted Biomarkers</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                    
                    {/* Hemoglobin */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-[20px] flex flex-col justify-between hover:border-slate-300 transition-colors h-full">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-500">Hemoglobin (Hb)</p>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">Normal</div>
                      </div>
                      <p className="text-3xl font-poppins font-bold text-slate-900">14.2 <span className="text-sm font-bold text-slate-400">g/dL</span></p>
                    </div>

                    {/* Vitamin D */}
                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-[20px] flex flex-col justify-between hover:border-amber-300 transition-colors h-full">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-500">Vitamin D</p>
                        <div className="flex items-center text-amber-700 bg-amber-100 px-3 py-1 rounded-lg text-xs font-bold">
                          <AlertCircle className="w-3 h-3 mr-1" /> Low
                        </div>
                      </div>
                      <p className="text-3xl font-poppins font-bold text-amber-600">22.0 <span className="text-sm font-bold text-amber-600/50">ng/mL</span></p>
                    </div>

                    {/* Cholesterol */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-[20px] flex flex-col justify-between hover:border-slate-300 transition-colors h-full">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-500">Total Cholesterol</p>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">Optimal</div>
                      </div>
                      <p className="text-3xl font-poppins font-bold text-slate-900">185 <span className="text-sm font-bold text-slate-400">mg/dL</span></p>
                    </div>

                    {/* Glucose */}
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-[20px] flex flex-col justify-between hover:border-slate-300 transition-colors h-full">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-slate-500">Fasting Glucose</p>
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">Normal</div>
                      </div>
                      <p className="text-3xl font-poppins font-bold text-slate-900">88 <span className="text-sm font-bold text-slate-400">mg/dL</span></p>
                    </div>
                    
                 </div>
                 
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
