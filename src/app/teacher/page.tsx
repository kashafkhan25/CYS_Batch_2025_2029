"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

type CourseOffering = {
  id: string;
  course: { code: string; title: string };
  batch: { id: string; currentSemester: number };
  section: string;
};

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [stats, setStats] = useState({ students: 0, submissions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ title: "", content: "" });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const courseRes = await fetch("/api/teacher/courses");
            if (courseRes.ok) {
                const data = await courseRes.json();
                setCourses(data);
                const statsRes = await fetch("/api/teacher/stats");
                if (statsRes.ok) setStats(await statsRes.json());
            }
            const scheduleRes = await fetch("/api/teacher/schedule/all");
            if (scheduleRes.ok) {
                setSchedules(await scheduleRes.json());
            }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };
    if (session?.user) fetchData();
  }, [session]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/teacher/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastData),
      });
      if (res.ok) {
        alert("Broadcast sent to all students!");
        setShowBroadcast(false);
        setBroadcastData({ title: "", content: "" });
      } else {
        const errText = await res.text();
        alert(`Failed to send broadcast: ${errText || res.statusText}`);
      }
    } catch (e: any) {
      alert(`Connection error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans tracking-tight text-slate-900 overflow-x-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <Image src="/logo.png" alt="BZU Logo" width={40} height={40} className="rounded-full shadow-lg border-2 border-indigo-500/30" />
          <div>
            <h2 className="text-xl font-black text-indigo-400 tracking-tighter italic">FACULTY</h2>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Instructor Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link href="/teacher" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-900/40">
            <span className="text-xl">🏠</span> Dashboard
          </Link>
          <Link href="/teacher/schedule" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition group">
            <span className="text-xl group-hover:scale-110 transition">📅</span> My Schedule
          </Link>
          <Link href="/teacher/grading" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 font-bold transition group">
            <span className="text-xl group-hover:scale-110 transition">📝</span> Grading
          </Link>
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 mb-6 px-2">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center font-black text-indigo-400 border border-indigo-500/30">
                {session?.user?.name?.charAt(0) || 'T'}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-black truncate text-white">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-black">{session?.user?.role}</p>
             </div>
           </div>
           <button 
             onClick={() => signOut()} 
             className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 font-bold text-sm transition uppercase tracking-widest"
           >
             <span>🚪</span> Log out
           </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <header className="mb-12 md:mb-16 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-4 bg-white rounded-2xl shadow-xl border border-slate-100 text-slate-900 active:scale-95 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
                <div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-2">Hello, {session?.user?.name?.split(' ')[0] || "Professor"}</h1>
                    <p className="text-slate-400 font-medium text-lg md:text-xl italic">Ready for today's lecture plan?</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setShowReport(true)}
                  className="flex-1 md:flex-none px-6 md:px-8 py-4 bg-white border border-slate-200 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  Stats Summary
                </button>
                <button 
                  onClick={() => setShowBroadcast(true)}
                  className="flex-1 md:flex-none px-6 md:px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-colors hover:shadow-indigo-100 active:scale-95"
                >
                  + Broadcast
                </button>
            </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
            <div className="xl:col-span-2 space-y-12">
                <section>
                    <div className="flex justify-between items-end mb-8">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Academic <span className="text-indigo-600">Progress.</span></h2>
                        <Link href="/teacher/grading" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Courses</Link>
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1,2,3,4].map(n => <div key={n} className="h-64 bg-white rounded-[40px] animate-pulse border border-slate-100 shadow-sm" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {courses.map((c) => (
                                <Link 
                                    key={c.id} 
                                    href={`/teacher/courses/${c.id}`}
                                    className="group relative bg-white rounded-[40px] border border-slate-100 p-8 md:p-10 hover:shadow-3xl transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700 opacity-50" />
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-block mb-6">{c.course.code}</p>
                                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-10 leading-none uppercase italic">{c.course.title}</h3>
                                        
                                        <div className="flex justify-between items-center">
                                            <div className="flex -space-x-3">
                                                {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">👤</div>)}
                                                <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg">+21</div>
                                            </div>
                                            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:bg-indigo-600 transition-colors shadow-xl group-hover:rotate-12 duration-300">&rarr;</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="bg-white rounded-[48px] p-10 md:p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
                    <h2 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10 italic">Quick Actions Centre</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <Link href="/teacher/schedule" className="flex flex-col items-center gap-4 transition-transform hover:-translate-y-2 group">
                            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-xl transition-all shadow-rose-100">📅</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-rose-600">Schedule</span>
                        </Link>
                        <button onClick={() => setShowBroadcast(true)} className="flex flex-col items-center gap-4 transition-transform hover:-translate-y-2 group">
                            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-xl transition-all shadow-amber-100">📣</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-600">Broadcast</span>
                        </button>
                        <Link href="/teacher/grading" className="flex flex-col items-center gap-4 transition-transform hover:-translate-y-2 group">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-sm group-hover:shadow-xl transition-all shadow-emerald-100">📊</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">Grading</span>
                        </Link>
                        <button className="flex flex-col items-center gap-4 transition-transform hover:-translate-y-2 group opacity-50 cursor-not-allowed">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm transition-all shadow-indigo-100">📥</div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resources</span>
                        </button>
                    </div>
                </section>
            </div>

            <div className="space-y-12">
                <section className="bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 relative z-10">Upcoming Sessions</h3>
                    <div className="space-y-8 relative z-10">
                        {schedules.length > 0 ? (
                            <>
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 flex flex-col items-center justify-center border border-indigo-500/30">
                                        <span className="text-xl font-black">{schedules[0].dayOfWeek.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="text-xl font-black tracking-tighter truncate text-indigo-100">{schedules[0].courseOffering.course.title}</h4>
                                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase">{schedules[0].startTime} - {schedules[0].room}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-white/5 w-full" />
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Next Slot Available</span>
                                    <span className="text-emerald-400">Confirmed</span>
                                </div>
                                <Link 
                                    href={`/teacher/courses/${schedules[0].courseOfferingId}`}
                                    className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl shadow-indigo-500/10 text-center active:scale-95"
                                >
                                    Open Builder
                                </Link>
                            </>
                        ) : (
                            <p className="text-slate-500 font-bold italic text-sm text-center py-8">No upcoming sessions scheduled.</p>
                        )}
                    </div>
                </section>

                <section className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
                    <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-10 italic underline decoration-indigo-200 underline-offset-4">Highlights</h3>
                    <div className="space-y-8">
                        <StatItem label="Active Students" value={stats.students} color="bg-indigo-500" />
                        <StatItem label="Avg. Attendance" value="84%" color="bg-emerald-400" />
                        <StatItem label="Pending Claims" value={stats.submissions} color="bg-amber-400" />
                    </div>
                </section>

                <div className="relative rounded-[48px] overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-200/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-violet-900 opacity-95 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative p-12 text-white">
                        <span className="text-6xl mb-8 block transform group-hover:rotate-12 transition-transform duration-500">🚀</span>
                        <h4 className="text-2xl font-black tracking-tighter mb-4 italic uppercase">AI Copilot is now active</h4>
                        <p className="text-[11px] font-bold text-indigo-100 leading-relaxed opacity-70 mb-8 uppercase tracking-widest">Draft quiz questions and analyze student sentiments automatically.</p>
                        <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-400 pb-1 hover:text-indigo-400 transition-colors">Try Insights &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {/* Global Broadcast Modal */}
      {showBroadcast && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[40px] p-8 md:p-12 max-w-lg w-full shadow-4xl animate-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Global <span className="text-indigo-600">Broadcast.</span></h3>
                      <button onClick={() => setShowBroadcast(false)} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                  </div>
                  <p className="text-slate-400 font-bold mb-8 text-[10px] uppercase tracking-[0.2em] italic">Notify students across all courses</p>
                  <form className="space-y-6" onSubmit={handleBroadcast}>
                      <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Message Title</label>
                           <input 
                             type="text" 
                             required
                             value={broadcastData.title}
                             onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                             placeholder="e.g., Midterm Schedule Update" 
                             className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold focus:ring-2 ring-indigo-500 transition shadow-inner" 
                           />
                      </div>
                      <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Content</label>
                           <textarea 
                             rows={4} 
                             required
                             value={broadcastData.content}
                             onChange={(e) => setBroadcastData({ ...broadcastData, content: e.target.value })}
                             placeholder="Type your message here..." 
                             className="w-full bg-slate-50 border-none rounded-[24px] px-6 py-4 font-bold focus:ring-2 ring-indigo-500 transition resize-none shadow-inner" 
                           />
                      </div>
                      <div className="flex gap-4 pt-4">
                           <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black text-[10px] tracking-widest rounded-3xl hover:bg-slate-200 transition-all uppercase">Cancel</button>
                           <button 
                             type="submit"
                             disabled={isLoading}
                             className="flex-[2] py-5 bg-indigo-600 text-white font-black text-[10px] tracking-widest rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase active:scale-95 disabled:opacity-50"
                           >
                             {isLoading ? "Sending..." : "Send to All"}
                           </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Stats Summary Modal */}
      {showReport && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
              <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-2xl w-full shadow-4xl animate-in zoom-in duration-300">
                  <div className="flex justify-between items-start mb-10">
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">Performance <span className="text-indigo-600">Report.</span></h3>
                      <button onClick={() => setShowReport(false)} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                       <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-110 shadow-inner">
                           <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Student Engagement</p>
                           <p className="text-5xl font-black text-indigo-600 tracking-tighter italic">84.2%</p>
                           <p className="text-[10px] font-bold text-slate-500 mt-6 leading-relaxed uppercase tracking-widest">Lesson access and resource downloads this month.</p>
                       </div>
                       <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-110 shadow-inner">
                           <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">Grading Efficiency</p>
                           <p className="text-5xl font-black text-emerald-600 tracking-tighter italic">92.0%</p>
                           <p className="text-[10px] font-bold text-slate-500 mt-6 leading-relaxed uppercase tracking-widest">Average turnaround time for feedback.</p>
                       </div>
                  </div>
                  <button onClick={() => setShowReport(false)} className="w-full py-5 bg-slate-900 text-white font-black text-[10px] tracking-widest rounded-3xl uppercase active:scale-95 shadow-xl">Close Overview</button>
              </div>
          </div>
      )}
    </div>
  );
}

function StatItem({ label, value, color }: { label: string, value: string | number, color: string }) {
    return (
        <div className="flex items-center justify-between group/stat">
            <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg`} />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover/stat:text-slate-900 transition-colors">{label}</span>
            </div>
            <span className="text-3xl font-black text-slate-900 tracking-tighter group-hover/stat:scale-110 transition-transform">{value}</span>
        </div>
    );
}
