"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Resource = { id: string; title: string; fileUrl: string };
type Lesson = { id: string; title: string; resources: Resource[] };
type Module = { id: string; title: string; lessons: Lesson[] };
type Quiz = { id: string; title: string; dueDate?: string; attempts: any[] };
type Assignment = { id: string; title: string; description?: string; dueDate: string; submissions: any[] };

export default function StudentCourseView({ params }: { params: Promise<{ id: string }> }) {
  const { id: offeringId } = use(params);
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState<"content" | "assessments" | "announcements" | "attendance">("content");
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseData();
    fetchAssessments();
    fetchAttendance();
    fetchAnnouncements();
    fetchProgress();
  }, [offeringId]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/student/modules?courseOfferingId=${offeringId}`);
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0) setActiveModuleId(data[0].id);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const fetchAssessments = async () => {
    try {
      const qRes = await fetch(`/api/student/quizzes?courseOfferingId=${offeringId}`);
      if (qRes.ok) setQuizzes(await qRes.json());
      const aRes = await fetch(`/api/student/assignments?courseOfferingId=${offeringId}`);
      if (aRes.ok) setAssignments(await aRes.json());
    } catch (e) { console.error(e); }
  };

  const fetchAttendance = async () => {
    try {
        const res = await fetch(`/api/student/attendance?courseOfferingId=${offeringId}`);
        if (res.ok) setAttendance(await res.json());
    } catch (e) { console.error(e); }
  }

  const fetchAnnouncements = async () => {
    try {
        const res = await fetch(`/api/student/announcements?courseOfferingId=${offeringId}`);
        if (res.ok) setAnnouncements(await res.json());
    } catch (e) { console.error(e); }
  }

  const fetchProgress = async () => {
    try {
        const res = await fetch(`/api/student/progress?courseOfferingId=${offeringId}`);
        if (res.ok) setCompletedLessons(await res.json());
    } catch (e) { console.error(e); }
  }

  const handleToggleProgress = async (lessonId: string) => {
    const isCompleted = completedLessons.includes(lessonId);
    setCompletedLessons(prev => isCompleted ? prev.filter(id => id !== lessonId) : [...prev, lessonId]);
    
    await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: !isCompleted })
    });
  };

  const handleAssignmentSubmit = async (assignmentId: string) => {
      const url = prompt("Enter submission file URL (e.g., Google Drive/OneDrive link):");
      if (!url) return;
      
      const res = await fetch("/api/student/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignmentId, fileUrl: url })
      });
      if (res.ok) {
          alert("Assignment submitted successfully!");
          fetchAssessments();
      }
  };

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans tracking-tight text-slate-900 overflow-hidden">
      <aside className="w-85 border-r border-slate-100 flex flex-col bg-white shadow-xl z-20">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
           <Link href="/student" className="text-slate-400 hover:text-indigo-600 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
             <span className="text-lg">←</span> Dashboard
           </Link>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <nav className="flex-1 overflow-y-auto p-6 space-y-3">
            <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8 border border-slate-100">
                <button onClick={() => setActiveTab("content")} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all duration-300 ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>MODULES</button>
                <button onClick={() => setActiveTab("assessments")} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all duration-300 ${activeTab === 'assessments' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>TASKS</button>
                <button onClick={() => setActiveTab("announcements")} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all duration-300 ${activeTab === 'announcements' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>NEWS</button>
                <button onClick={() => setActiveTab("attendance")} className={`flex-1 py-3 text-[10px] font-black rounded-[18px] transition-all duration-300 ${activeTab === 'attendance' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100 border border-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}>STATS</button>
            </div>

            {activeTab === 'content' && (
                <div className="space-y-2">
                    <h3 className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Syllabus</h3>
                    {modules.map(m => (
                        <button 
                            key={m.id} 
                            onClick={() => setActiveModuleId(m.id)} 
                            className={`w-full text-left px-6 py-4 rounded-[28px] transition-all duration-300 group flex items-center justify-between gap-4 ${activeModuleId === m.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'hover:bg-slate-50 text-slate-600 font-bold'}`}
                        >
                            <span className="truncate flex-1">{m.title}</span>
                            {m.lessons.every(l => completedLessons.includes(l.id)) ? (
                                <span className="text-emerald-400 text-lg">✓</span>
                            ) : (
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-indigo-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'assessments' && (
                 <div className="space-y-6">
                    <h3 className="px-4 py-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quizzes</h3>
                    {quizzes.map(q => (
                        <div key={q.id} className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                            <p className="text-[9px] font-black text-indigo-500 uppercase mb-1">Assessment</p>
                            <p className="text-sm font-black text-slate-800 line-clamp-1">{q.title}</p>
                        </div>
                    ))}
                 </div>
            )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-slate-50/20">
        {activeTab === 'content' ? (
            activeModule ? (
                <div className="max-w-5xl mx-auto p-12 lg:p-24 relative">
                    <header className="mb-24 relative">
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100">{activeModule.title}</span>
                        <h1 className="text-7xl font-black text-slate-900 tracking-tighter mt-10 leading-none">Learning <br/><span className="text-indigo-600">Resources.</span></h1>
                    </header>
                    
                    <div className="space-y-24">
                        {activeModule.lessons.map((lesson, idx) => (
                            <section key={lesson.id} className="relative pl-20 group">
                                <div className="absolute left-0 top-0 h-full w-[2px] bg-slate-100 group-last:h-0" />
                                <div className={`absolute -left-[19px] top-0 w-10 h-10 rounded-2xl bg-white border-2 flex items-center justify-center font-black text-xs transition-all duration-500 shadow-sm z-10 ${completedLessons.includes(lesson.id) ? 'border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-100' : 'border-slate-100 text-slate-200 group-hover:border-indigo-600 group-hover:text-indigo-600 group-hover:rotate-12'}`}>
                                    {completedLessons.includes(lesson.id) ? "✓" : idx + 1}
                                </div>
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8 mb-12">
                                    <h3 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">{lesson.title}</h3>
                                    <button 
                                        onClick={() => handleToggleProgress(lesson.id)}
                                        className={`w-fit px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${completedLessons.includes(lesson.id) ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-white text-slate-400 border border-slate-100 shadow-sm hover:shadow-xl hover:text-indigo-600 hover:border-indigo-200'}`}
                                    >
                                        {completedLessons.includes(lesson.id) ? "COMPLETED" : "MARK AS DONE"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {lesson.resources.map(res => (
                                        <a key={res.id} href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-8 rounded-[40px] border border-white bg-white shadow-2xl shadow-indigo-100/30 hover:shadow-indigo-200/50 hover:-translate-y-2 transition-all duration-500 group/card">
                                            <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center text-3xl group-hover/card:bg-indigo-600 group-hover/card:text-white transition-all duration-500 shadow-inner">
                                                {res.title.toLowerCase().includes('pdf') ? '📕' : res.title.toLowerCase().includes('link') ? '🔗' : '📄'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-lg font-black text-slate-800 truncate leading-tight group-hover/card:text-indigo-600 transition-colors uppercase tracking-tighter">{res.title}</p>
                                                <p className="text-[10px] text-slate-300 font-black truncate uppercase tracking-[0.2em] mt-2">Material / Static</p>
                                            </div>
                                        </a>
                                    ))}
                                    {lesson.resources.length === 0 && (
                                        <div className="col-span-full py-12 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No resources uploaded for this lesson</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 lg:p-24">
                    <div className="w-64 h-64 bg-indigo-50 rounded-[80px] flex items-center justify-center shadow-4xl shadow-indigo-100/50 mb-12 animate-bounce-slow">
                        <span className="text-8xl">🚀</span>
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-none">Pick your path.</h2>
                    <p className="text-slate-400 font-bold text-lg max-w-md mx-auto">Select a module from the sidebar to dive into the learning materials.</p>
                </div>
            )
        ) : activeTab === 'assessments' ? (
            <div className="max-w-6xl mx-auto p-12 lg:p-24">
                <header className="mb-24">
                    <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">Your <span className="text-indigo-600">Tasks.</span></h1>
                    <p className="text-slate-400 font-bold text-xl mt-6">Assessments and project submissions.</p>
                </header>
                
                <div className="space-y-32">
                    <section>
                        <div className="flex justify-between items-end mb-12">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Knowledge Quizzes</h2>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">{quizzes.length} ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {quizzes.map(q => (
                                <div key={q.id} className="group bg-white p-10 rounded-[56px] border border-white shadow-3xl shadow-indigo-100/40 flex flex-col hover:-translate-y-3 transition-all duration-500">
                                    <div className="flex-1">
                                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl mb-8 shadow-inner font-black group-hover:rotate-12 transition-transform">Q</div>
                                        <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter leading-tight">{q.title}</h3>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                                            {q.dueDate ? `Deadline: ${new Date(q.dueDate).toLocaleDateString()}` : "No time limit"}
                                        </p>
                                    </div>
                                    <div className="mt-12">
                                        {q.attempts.length > 0 ? (
                                            <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-[28px] border border-emerald-100">
                                                <span className="text-emerald-700 font-black text-[10px] tracking-widest">FINISHED</span>
                                                <span className="text-emerald-900 font-black text-2xl tracking-tighter">{q.attempts[0].score || 0}</span>
                                            </div>
                                        ) : (
                                            <button className="w-full py-5 bg-slate-900 text-white font-black rounded-[28px] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all duration-300 uppercase tracking-widest text-[10px]">Start Evaluation</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-end mb-12">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Course Projects</h2>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full border border-rose-100">Deadline Bound</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {assignments.map(a => (
                                <div key={a.id} className="bg-white p-12 rounded-[64px] border border-white shadow-3xl shadow-indigo-100/30 flex flex-col lg:flex-row gap-12">
                                    <div className="flex-1">
                                        <h3 className="text-4xl font-black text-slate-800 mb-6 tracking-tighter leading-none">{a.title}</h3>
                                        <p className="text-slate-400 font-medium leading-relaxed text-lg line-clamp-3 mb-8">{a.description || "No description provided."}</p>
                                        <div className="flex items-center gap-12 pt-8 border-t border-slate-50">
                                             <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Target Date</p>
                                                <p className="text-xl font-black text-slate-800 tracking-tight">{new Date(a.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                             </div>
                                             {a.submissions.length > 0 ? (
                                                 <div className="flex items-center gap-3">
                                                     <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                                     <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest">In Review</span>
                                                 </div>
                                             ) : (
                                                 <button onClick={() => handleAssignmentSubmit(a.id)} className="bg-indigo-600 text-white px-10 py-4 rounded-[28px] text-[10px] font-black hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest">Upload</button>
                                             )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        ) : activeTab === 'announcements' ? (
            <div className="max-w-4xl mx-auto p-12 lg:p-24">
                <header className="mb-24">
                    <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">News <br/><span className="text-indigo-600">Feed.</span></h1>
                    <p className="text-slate-400 font-bold text-xl mt-6">Latest updates from your instructor.</p>
                </header>
                <div className="space-y-10">
                     {announcements.map(n => (
                         <div key={n.id} className="bg-white p-12 rounded-[56px] border border-white shadow-3xl shadow-slate-100/50">
                             <div className="flex justify-between items-start mb-8">
                                <h3 className="text-4xl font-black text-indigo-900 tracking-tighter leading-none">{n.title}</h3>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-slate-500 font-medium text-xl leading-relaxed whitespace-pre-line">{n.content}</p>
                         </div>
                     ))}
                     {announcements.length === 0 && (
                         <div className="py-24 text-center bg-white rounded-[64px] border-4 border-dashed border-slate-100">
                             <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">No updates at the moment</p>
                         </div>
                     )}
                </div>
            </div>
        ) : (
            <div className="max-w-5xl mx-auto p-12 lg:p-24">
                <header className="mb-24">
                    <h1 className="text-8xl font-black text-slate-900 tracking-tighter leading-none">Track <br/><span className="text-indigo-600">Activity.</span></h1>
                    <p className="text-slate-400 font-bold text-xl mt-6">Consistency is the key to mastery.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    {attendance.map(record => (
                        <div key={record.id} className={`p-10 rounded-[48px] border-4 flex flex-col items-center justify-center gap-6 transition-all duration-500 hover:scale-105 ${record.status === 'PRESENT' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : record.status === 'ABSENT' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-amber-50 border-amber-100 text-amber-900'}`}>
                            <div className="text-3xl font-black uppercase tracking-tighter italic">{record.status}</div>
                            <div className="px-5 py-2 bg-white/50 rounded-full text-[10px] font-black uppercase tracking-widest opacity-80">{new Date(record.session.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                        </div>
                    ))}
                    {attendance.length === 0 && <div className="col-span-full py-24 text-center text-slate-300 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[56px]">No records found</div>}
                </div>

                <div className="p-16 bg-slate-900 rounded-[64px] text-white shadow-4xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-12">
                        <div>
                            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Course Presence</p>
                            <h2 className="text-9xl font-black tracking-tighter leading-none">
                                {attendance.length > 0 ? Math.round((attendance.filter(r => r.status === 'PRESENT').length / attendance.length) * 100) : 0}<span className="text-indigo-500 font-black">%</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg mt-8">Keep showing up. You're doing great.</p>
                        </div>
                        <div className="w-32 h-32 rounded-[40px] bg-white/5 backdrop-blur-3xl flex items-center justify-center text-5xl">📊</div>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
