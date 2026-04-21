"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Submission = {
    id: string;
    student: { name: string; email: string };
    assignment: { title: string };
    fileUrl: string;
    submittedAt: string;
    grade?: number;
    feedback?: string;
};

export default function GradingPortal() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/teacher/submissions");
        if (res.ok) setSubmissions(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) fetchSubmissions();
  }, [session]);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/teacher/submissions/${selectedSub.id}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: gradeInput, feedback: feedbackInput }),
      });
      if (res.ok) {
        setSubmissions(prev => prev.map(s => s.id === selectedSub.id ? { ...s, grade: parseInt(gradeInput), feedback: feedbackInput } : s));
        setSelectedSub(null);
      } else {
        alert("Failed to save grade");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans tracking-tight text-slate-900 overflow-x-hidden">
       <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-24">
            <Link href="/teacher" className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-600 transition mb-12 inline-flex items-center gap-2 group italic">
              <span className="text-lg group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
            </Link>
            
            <header className="mb-16 md:mb-24">
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none italic uppercase">Grading <br/><span className="text-indigo-600">Center.</span></h1>
                <p className="text-slate-400 font-bold text-lg md:text-xl">Review and validate your students' hard work.</p>
            </header>

            {isLoading ? (
                <div className="space-y-8">
                    {[1,2,3].map(n => <div key={n} className="h-40 bg-white rounded-[48px] animate-pulse border border-slate-100 shadow-sm" />)}
                </div>
            ) : (
                <div className="space-y-8">
                    {submissions.map(s => (
                        <div key={s.id} className="group bg-white p-6 md:p-12 rounded-[56px] border border-white shadow-3xl shadow-indigo-100/20 flex flex-col xl:flex-row items-center justify-between gap-12 hover:shadow-indigo-100 transition-all duration-500 hover:-translate-y-2">
                             <div className="flex items-center gap-6 md:gap-10 flex-1">
                                <div className="w-16 h-16 md:w-24 md:h-24 rounded-[32px] bg-slate-50 flex items-center justify-center text-3xl md:text-5xl shadow-inner group-hover:scale-110 transition-transform">📄</div>
                                <div>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <p className="text-[9px] font-black text-indigo-500 subtitle uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{s.assignment.title}</p>
                                        {s.grade !== undefined && s.grade !== null && (
                                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Graded: {s.grade}/100</p>
                                        )}
                                    </div>
                                    <h3 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">{s.student.name}</h3>
                                    <p className="text-slate-400 font-bold text-sm mt-3 tracking-widest">{s.student.email}</p>
                                </div>
                             </div>
                             
                             <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full xl:w-auto">
                                <a href={s.fileUrl} target="_blank" className="flex-1 md:flex-none text-center px-8 py-5 bg-white border border-slate-100 text-[10px] font-black rounded-[24px] shadow-sm hover:shadow-xl transition-all uppercase tracking-widest text-slate-500 hover:text-slate-900">View Work</a>
                                <button 
                                    onClick={() => {
                                        setSelectedSub(s);
                                        setGradeInput(s.grade?.toString() || "");
                                        setFeedbackInput(s.feedback || "");
                                    }} 
                                    className="flex-1 md:flex-none px-10 py-5 bg-slate-900 text-white text-[10px] font-black rounded-[28px] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-100 transition-all uppercase tracking-widest active:scale-95"
                                >
                                    {s.grade !== undefined && s.grade !== null ? "Edit Grade" : "Mark Now"}
                                </button>
                             </div>
                        </div>
                    ))}
                    {submissions.length === 0 && (
                        <div className="py-40 text-center rounded-[64px] border-4 border-dashed border-slate-100 bg-white shadow-inner">
                            <span className="text-8xl mb-10 block grayscale opacity-40">🎉</span>
                            <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">All caught up! No pending submissions.</p>
                        </div>
                    )}
                </div>
            )}
       </div>

       {/* Grading Modal */}
       {selectedSub && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full shadow-4xl animate-in zoom-in duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Mark <span className="text-indigo-600">Work.</span></h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{selectedSub.student.name}</p>
                        </div>
                        <button onClick={() => setSelectedSub(null)} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                    </div>

                    <form onSubmit={handleGradeSubmit} className="space-y-8">
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Numeric Grade (0-100)</label>
                             <input 
                                type="number" 
                                min="0" 
                                max="100"
                                required
                                value={gradeInput}
                                onChange={(e) => setGradeInput(e.target.value)}
                                placeholder="85" 
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-black text-2xl focus:ring-2 ring-indigo-500 transition shadow-inner" 
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Feedback / Comments</label>
                             <textarea 
                                rows={4} 
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                placeholder="Great work on the network diagrams..." 
                                className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-4 font-bold focus:ring-2 ring-indigo-500 transition resize-none shadow-inner" 
                             />
                        </div>
                        <div className="flex gap-4">
                             <button type="button" onClick={() => setSelectedSub(null)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black text-[10px] tracking-widest rounded-3xl hover:bg-slate-200 transition-all uppercase italic">Cancel</button>
                             <button 
                                type="submit" 
                                disabled={isSaving}
                                className="flex-[2] py-5 bg-indigo-600 text-white font-black text-[10px] tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase italic active:scale-95 disabled:opacity-50"
                             >
                                 {isSaving ? "Saving..." : "Publish Mark"}
                             </button>
                        </div>
                    </form>
                </div>
            </div>
       )}
    </div>
  );
}
