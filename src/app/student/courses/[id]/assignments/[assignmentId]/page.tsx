"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function StudentAssignmentPage({ params }: { params: Promise<{ id: string, assignmentId: string }> }) {
  const { id: offeringId, assignmentId } = use(params);
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/teacher/assignments?courseOfferingId=${offeringId}`)
      .then(res => res.json())
      .then(data => {
          const a = data.find((item: any) => item.id === assignmentId);
          if (a) setAssignment(a);
      })
      .finally(() => setIsLoading(false));
  }, [assignmentId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Mock S3 upload for demonstration
    const mockUrl = `https://s3.bzu.edu.pk/submissions/${Math.random().toString(36).substring(7)}.pdf`;
    
    const res = await fetch("/api/teacher/assignments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, fileUrl: mockUrl })
    });
    
    if (res.ok) {
        setSubmissionSuccess(true);
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center font-black text-indigo-300 text-3xl animate-pulse">Loading assignment details...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white p-12 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20">
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Active Assignment</p>
            <h1 className="text-4xl font-black tracking-tighter">{assignment?.title}</h1>
          </div>
          <button onClick={() => router.back()} className="px-6 py-3 border border-slate-200 rounded-2xl font-black text-xs hover:bg-slate-50 transition">EXIT</button>
      </header>

      <main className="max-w-4xl mx-auto p-12 py-20 flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-12">
              <section className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Task Description</h2>
                  <div className="prose prose-slate max-w-none">
                      <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">{assignment?.description}</p>
                  </div>
              </section>

              <section className="bg-white p-12 rounded-[48px] shadow-sm border border-slate-100">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Submission Status</h2>
                  {submissionSuccess ? (
                      <div className="flex items-center gap-6 p-6 bg-green-50 rounded-3xl border border-green-100">
                          <div className="text-4xl">✅</div>
                          <div>
                              <p className="font-black text-green-800">Work Submitted Successfully</p>
                              <p className="text-sm text-green-600 font-bold uppercase tracking-widest mt-1">Status: Pending Grading</p>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center p-12 border-4 border-dashed border-slate-100 rounded-[40px]">
                          <div className="text-6xl mb-6">📤</div>
                          <p className="text-slate-400 font-bold mb-8">Drag and drop your work or click the button below.</p>
                          <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 uppercase tracking-widest text-xs disabled:opacity-50"
                          >
                            {isSubmitting ? "UPLOADING..." : "UPLOAD SUBMISSION"}
                          </button>
                      </div>
                  )}
              </section>
          </div>

          <aside className="w-full md:w-80 space-y-6">
              <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Deadline</p>
                  <p className="text-2xl font-black tracking-tighter mb-2">
                      {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleTimeString() : ''}
                  </p>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Assessment Type</p>
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">📄</div>
                      <div>
                          <p className="font-black text-slate-800">Digital Copy</p>
                          <p className="text-[10px] font-bold text-slate-400">PDF Preferred</p>
                      </div>
                  </div>
              </div>
          </aside>
      </main>
    </div>
  );
}
