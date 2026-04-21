"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

type CourseOffering = {
  id: string;
  course: { code: string; title: string };
  section: string;
};

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [batchInfo, setBatchInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCGPACalc, setShowCGPACalc] = useState(false);
  const [submissionData, setSubmissionData] = useState<{id: string, title: string} | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const courseRes = await fetch("/api/student/courses");
            if (courseRes.ok) setCourses(await courseRes.json());

            if (session?.user?.batchId) {
                const batchRes = await fetch(`/api/admin/batches/${session.user.batchId}`);
                if (batchRes.ok) setBatchInfo(await batchRes.json());

                const announceRes = await fetch(`/api/student/announcements?batchId=${session.user.batchId}`);
                if (announceRes.ok) setAnnouncements(await announceRes.json());

                const assignRes = await fetch(`/api/student/assignments?batchId=${session.user.batchId}`);
                if (assignRes.ok) setAssignments(await assignRes.json());
            }

        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };
    if (session?.user) fetchData();
  }, [session]);

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionData || !submissionUrl) return;
    
    try {
        const res = await fetch("/api/student/assignments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignmentId: submissionData.id, fileUrl: submissionUrl })
        });
        if (res.ok) {
            alert("Assignment submitted successfully!");
            setSubmissionData(null);
            setSubmissionUrl("");
        }
    } catch (e) {
        alert("Failed to submit assignment.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans tracking-tight text-slate-900 overflow-x-hidden transition-all duration-500">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-100 flex flex-col p-8 z-50 transform transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-12 flex items-center gap-4">
           <Image src="/logo.png" alt="BZU Logo" width={48} height={48} className="rounded-full shadow-lg" />
           <div>
             <h2 className="text-2xl font-black text-indigo-900 tracking-tighter italic">BZU<span className="text-indigo-500 font-black">LMS</span></h2>
             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Student Portal</p>
           </div>
        </div>

        <nav className="flex-1 space-y-3">
            <Link href="/student" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-indigo-600 text-white font-black shadow-2xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95">
                <span className="text-xl">🏠</span> Dashboard
            </Link>
            <Link href="/student/library" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 rounded-3xl text-slate-400 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all group">
                <span className="text-xl group-hover:scale-110 transition">📚</span> My Library
            </Link>
            <Link href="/student/achievements" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 rounded-3xl text-slate-400 font-bold hover:bg-slate-50 hover:text-indigo-600 transition-all group">
                <span className="text-xl group-hover:scale-110 transition">🏆</span> Achievements
            </Link>
        </nav>

        <div className="mt-12 p-8 bg-indigo-50/50 rounded-[40px] border border-indigo-100/50">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600 font-black text-2xl border border-indigo-50">
                    {session?.user?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-sm font-black text-indigo-900 truncate">{session?.user?.name}</h4>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
                        {session?.user?.rollNumber || "REG STUDENT"}
                    </p>
                </div>
             </div>
             <button 
                onClick={() => signOut()}
                className="w-full py-4 bg-white border border-indigo-100 text-indigo-600 font-black text-[10px] tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all shadow-sm uppercase"
            >
                LOG OUT
             </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <header className="mb-12 lg:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="relative group">
                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-3 bg-white rounded-2xl shadow-xl border border-slate-100 mb-8 text-indigo-600 active:scale-95 transition flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <h1 className="text-5xl md:text-7xl font-black text-slate-910 tracking-tighter mb-4 leading-none animate-in fade-in slide-in-from-left duration-700">
                    Focus on <span className="text-indigo-600">Growth.</span>
                </h1>
                <p className="text-slate-400 font-bold text-xl">
                    {greeting}, {session?.user?.name?.split(' ')[0]}!
                </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-100/50 flex gap-10 items-center animate-in zoom-in duration-500">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</p>
                    <p className="text-3xl font-black text-indigo-600 tracking-tighter">{batchInfo?.currentSemester || "N/A"}</p>
                </div>
                <div className="w-px h-12 bg-slate-100" />
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GPA</p>
                    <p className="text-3xl font-black text-rose-500 tracking-tighter">3.85</p>
                </div>
            </div>
        </header>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[1,2,3,4].map(n => <div key={n} className="h-80 bg-white rounded-[48px] animate-pulse border border-slate-50 shadow-sm" />)}
            </div>
        ) : courses.length === 0 ? (
            <div className="bg-white rounded-[56px] p-12 md:p-24 text-center shadow-3xl shadow-indigo-100/50 border border-white max-w-4xl mx-auto mt-20">
                <div className="text-7xl md:text-9xl mb-8 md:mb-12">✨</div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-none">Your journey starts here.</h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-bold text-lg">
                    Once your department finalizes course assignments, your learning materials will appear here.
                </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-16">
                <div className="xl:col-span-2 space-y-12 md:space-y-20">
                    <section>
                        <div className="flex justify-between items-end mb-8 md:mb-12">
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">My Active Courses</h2>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{courses.length} ENROLLED</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                            {courses.map(c => (
                                <Link 
                                    key={c.id} 
                                    href={`/student/courses/${c.id}`}
                                    className="group relative bg-white rounded-[48px] p-8 md:p-10 border border-white shadow-2xl shadow-indigo-100/40 hover:shadow-3xl hover:-translate-y-3 transition-all duration-500 overflow-hidden flex flex-col min-h-[300px]"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-700 opacity-60" />
                                    <div className="relative z-10 flex-1">
                                        <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-2xl">{c.course.code}</span>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter mt-8 leading-tight group-hover:text-indigo-600 transition-colors uppercase italic">{c.course.title}</h3>
                                    </div>
                                    <div className="relative z-10 flex justify-between items-end pt-8">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Section</p>
                                            <p className="font-black text-slate-800 text-xl">{c.section}</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:bg-indigo-600 group-hover:shadow-xl group-hover:shadow-indigo-200 transition-all duration-300 transform group-hover:rotate-12">&rarr;</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white rounded-[56px] p-8 md:p-12 lg:p-16 border border-slate-50 shadow-3xl shadow-indigo-100/20">
                        <div className="flex justify-between items-center mb-10 md:mb-12">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Latest Announcements</h2>
                            <Link href="/student/announcements" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View History</Link>
                        </div>
                        <div className="space-y-6">
                            {announcements.slice(0, 3).map(a => (
                                <div key={a.id} className="group p-6 md:p-8 rounded-[36px] bg-slate-50 hover:bg-white hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-indigo-50 flex gap-4 md:gap-6 items-start">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">📣</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{a.courseOffering?.course?.code || "GLOBAL"}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase">{new Date(a.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <h4 className="font-black text-slate-800 text-lg leading-tight mb-2 truncate group-hover:text-indigo-600 transition-colors uppercase italic">{a.title}</h4>
                                        <p className="text-slate-500 font-medium text-sm line-clamp-1">{a.content}</p>
                                    </div>
                                </div>
                            ))}
                            {announcements.length === 0 && <p className="text-slate-300 text-center py-12 font-bold italic">Silence is golden. No news today.</p>}
                        </div>
                    </section>
                </div>

                <div className="space-y-12 md:space-y-16">
                    <section className="bg-indigo-600 rounded-[56px] p-10 md:p-12 text-white shadow-4xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h2 className="text-[11px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-12">Academic Stats</h2>
                        <div className="space-y-10 relative z-10">
                            <StatCircle label="Attendance" value="92%" />
                            <StatCircle label="AVG. GPA" value="3.85" />
                            <StatCircle label="Tasks Done" value="14/16" />
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[56px] p-10 md:p-12 text-white shadow-4xl shadow-slate-200 group">
                         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">GPA Tools</h2>
                         <button 
                            onClick={() => setShowCGPACalc(true)}
                            className="w-full py-5 md:py-6 bg-indigo-600 text-white font-black text-xs tracking-widest rounded-[28px] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 uppercase active:scale-95"
                         >
                            Open Calculator
                         </button>
                    </section>

                    <section>
                         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 md:mb-10 pl-4">Critical Deadlines</h2>
                         <div className="space-y-6">
                             {assignments.filter(a => a.dueDate && new Date(a.dueDate) > new Date()).slice(0, 4).map(a => {
                                 const daysLeft = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                 return (
                                     <div key={a.id} className="group bg-white p-8 rounded-[40px] border-l-[12px] border-l-rose-500 border border-slate-50 shadow-2xl shadow-rose-100/30 flex flex-col gap-6 hover:shadow-rose-200/50 transition-all duration-500 hover:-translate-y-1">
                                         <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">{a.courseOffering?.course?.code}</p>
                                            <h4 className="font-black text-slate-800 text-base leading-tight truncate group-hover:text-rose-600 transition-colors uppercase">{a.title}</h4>
                                            <div className="flex items-center gap-2 mt-4">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">{daysLeft} Days Remaining</p>
                                            </div>
                                         </div>
                                         <button 
                                            onClick={() => setSubmissionData({ id: a.id, title: a.title })}
                                            className="w-full py-4 bg-rose-50 text-rose-600 font-black text-[10px] tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm uppercase px-4 active:scale-95"
                                         >
                                            Submit Now
                                         </button>
                                     </div>
                                 );
                             })}
                             {assignments.length === 0 && (
                                 <div className="bg-emerald-50 p-10 rounded-[40px] border border-emerald-100 text-center shadow-lg shadow-emerald-50">
                                     <p className="text-4xl mb-4">🌴</p>
                                     <p className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">No pending deadlines</p>
                                 </div>
                             )}
                         </div>
                    </section>
                </div>
            </div>
        )}

        {/* Modals */}
        {showCGPACalc && <CGPACalculator onClose={() => setShowCGPACalc(false)} />}
        {submissionData && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-md w-full shadow-4xl animate-in zoom-in duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Submit <span className="text-rose-500 italic">Work.</span></h3>
                        <button onClick={() => setSubmissionData(null)} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                    </div>
                    <p className="text-slate-400 font-bold mb-8 uppercase text-[10px] tracking-[0.3em] leading-relaxed">
                        Task: <span className="text-slate-800">{submissionData.title}</span>
                    </p>
                    <form onSubmit={handleSubmission} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6">Submission URL / Link</label>
                            <input 
                                required
                                type="url"
                                placeholder="Paste your work link here..."
                                className="w-full bg-slate-50 border-none rounded-[28px] px-8 py-5 font-bold focus:ring-2 ring-rose-500 transition shadow-inner"
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setSubmissionData(null)}
                                className="flex-1 py-5 bg-slate-100 text-slate-400 font-black text-[10px] tracking-widest rounded-[24px] hover:bg-slate-200 transition-all uppercase"
                            >
                                Close
                            </button>
                            <button 
                                type="submit"
                                className="flex-[2] py-5 bg-rose-500 text-white font-black text-[10px] tracking-widest rounded-[24px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 uppercase active:scale-95"
                            >
                                Confirm Submission
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

function CGPACalculator({ onClose }: { onClose: () => void }) {
    const [semesters, setSemesters] = useState([{ sgpa: "" }, { sgpa: "" }]);
    const [cgpa, setCgpa] = useState<number | null>(null);

    const calculate = () => {
        const values = semesters.map(s => parseFloat(s.sgpa)).filter(v => !isNaN(v));
        if (values.length === 0) return;
        const total = values.reduce((a, b) => a + b, 0);
        setCgpa(total / values.length);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-lg w-full shadow-4xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-10">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">CGPA <span className="text-indigo-600">Calc.</span></h3>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                </div>
                <div className="space-y-4 mb-8">
                    {semesters.map((s, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-full bg-slate-100 rounded-[24px] px-8 py-5 flex items-center justify-between border border-transparent focus-within:border-indigo-100 transition shadow-inner">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester {i + 1}</span>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0" 
                                    max="4"
                                    placeholder="0.0"
                                    className="bg-transparent border-none text-right font-black text-slate-900 w-20 focus:ring-0 text-xl"
                                    value={s.sgpa}
                                    onChange={(e) => {
                                        const n = [...semesters];
                                        n[i].sgpa = e.target.value;
                                        setSemesters(n);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                     <button 
                        onClick={() => setSemesters([...semesters, { sgpa: "" }])}
                        className="flex-1 py-5 bg-slate-100 text-slate-500 font-black text-[10px] tracking-widest rounded-3xl hover:bg-slate-200 transition-all uppercase"
                     >
                        + Add Sem
                     </button>
                     <button 
                        onClick={calculate}
                        className="flex-1 py-5 bg-indigo-600 text-white font-black text-[10px] tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase active:scale-95"
                     >
                        Calculate
                     </button>
                </div>
                {cgpa !== null && (
                    <div className="bg-indigo-50 p-8 rounded-[40px] text-center border border-indigo-100 animate-in fade-in slide-in-from-bottom duration-500">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Estimated CGPA</p>
                        <p className="text-6xl font-black text-indigo-600 tracking-tighter">{cgpa.toFixed(2)}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCircle({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between group/stat">
            <span className="text-indigo-200 font-bold uppercase text-[10px] tracking-[0.2em] group-hover/stat:text-white transition-colors">{label}</span>
            <span className="text-3xl font-black tracking-tighter group-hover/stat:scale-110 transition-transform">{value}</span>
        </div>
    );
}
