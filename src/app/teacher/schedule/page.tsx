"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Schedule = {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    courseOffering: {
        id: string;
        course: { title: string; code: string };
    };
};

type Option = { id: string, title: string };

export default function TeacherSchedulePage() {
  const { data: session } = useSession();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
      dayOfWeek: "MON",
      startTime: "09:00",
      endTime: "10:30",
      room: "",
      courseOfferingId: ""
  });

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schRes, courRes] = await Promise.all([
          fetch("/api/teacher/schedule"),
          fetch("/api/teacher/courses")
        ]);
        if (schRes.ok) setSchedules(await schRes.json());
        if (courRes.ok) {
            const data = await courRes.json();
            setCourses(data.map((c: any) => ({ id: c.id, title: `${c.course.code} - ${c.course.title}` })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) fetchData();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch("/api/teacher/schedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            const newSch = await res.json();
            // Re-fetch or local update
            window.location.reload(); 
        }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Remove this session?")) return;
      try {
          const res = await fetch(`/api/teacher/schedule/${id}`, { method: "DELETE" });
          if (res.ok) setSchedules(prev => prev.filter(s => s.id !== id));
      } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans tracking-tight text-slate-900 overflow-x-hidden">
       <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-24">
            <Link href="/teacher" className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-indigo-600 transition mb-12 inline-flex items-center gap-2 group italic">
              <span className="text-lg group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
            </Link>
            
            <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
                <div>
                    <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4 leading-none italic uppercase">Lecture <br/><span className="text-indigo-600">Planner.</span></h1>
                    <p className="text-slate-400 font-bold text-lg md:text-xl">Manage your academic availability and sessions.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-10 py-5 bg-slate-900 text-white rounded-[32px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all hover:-translate-y-2 active:scale-95"
                >
                    + Add Session
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
                {days.map((day) => (
                    <div key={day} className="space-y-6">
                        <div className="text-center py-4 bg-white rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-indigo-500/20">
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</h3>
                        </div>
                        <div className="flex flex-col gap-6 min-h-[400px]">
                            {schedules.filter(s => s.dayOfWeek.toUpperCase().startsWith(day.substring(0,3))).map(s => (
                                <div key={s.id} className="group relative bg-white p-6 rounded-[32px] border border-white shadow-xl shadow-indigo-100/20 hover:shadow-2xl transition-all duration-300">
                                    <button 
                                        onClick={() => handleDelete(s.id)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        &times;
                                    </button>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3 underline decoration-indigo-200 underline-offset-4">{s.startTime}</p>
                                    <h4 className="font-black text-slate-800 text-xs leading-tight mb-4 uppercase italic">{s.courseOffering.course.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{s.room || "TBA"}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex-1 rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-100/30 flex items-center justify-center p-4">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic opacity-40">Free</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
       </div>

       {/* Add Session Modal */}
       {isModalOpen && (
           <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
               <div className="bg-white rounded-[48px] p-8 md:p-12 max-w-xl w-full shadow-4xl animate-in zoom-in duration-300">
                    <div className="flex justify-between items-start mb-10">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase underline decoration-indigo-100 underline-offset-8">Add <span className="text-indigo-600">Session.</span></h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition text-2xl font-bold">&times;</button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Select Course</label>
                             <select 
                                required
                                value={formData.courseOfferingId}
                                onChange={(e) => setFormData({...formData, courseOfferingId: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition shadow-inner"
                             >
                                <option value="">Select a course...</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Day</label>
                             <select 
                                value={formData.dayOfWeek}
                                onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition shadow-inner"
                             >
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Room / Lab</label>
                             <input 
                                type="text"
                                value={formData.room}
                                onChange={(e) => setFormData({...formData, room: e.target.value})}
                                placeholder="Room 402"
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition shadow-inner"
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Start Time</label>
                             <input 
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition shadow-inner"
                             />
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">End Time</label>
                             <input 
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                className="w-full bg-slate-50 border-none rounded-[20px] px-6 py-4 font-bold text-sm focus:ring-2 ring-indigo-500 transition shadow-inner"
                             />
                        </div>
                        <div className="col-span-2 flex gap-4 pt-6">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 font-black text-[10px] tracking-widest rounded-3xl hover:bg-slate-200 transition-all uppercase italic">Cancel</button>
                             <button type="submit" className="flex-[2] py-5 bg-slate-900 text-white font-black text-[10px] tracking-widest rounded-3xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 uppercase italic active:scale-95">Confirm Session</button>
                        </div>
                    </form>
               </div>
           </div>
       )}
    </div>
  );
}
