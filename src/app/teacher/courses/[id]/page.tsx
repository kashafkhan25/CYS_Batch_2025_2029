"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

type Resource = { id: string; title: string; fileUrl: string; type: string };
type Lesson = { id: string; title: string; resources: Resource[] };
type Module = { id: string; title: string; lessons: Lesson[] };

export default function TeacherCourseBuilder({ params }: { params: Promise<{ id: string }> }) {
  const { id: offeringId } = use(params);
  
  const [activeTab, setActiveTab] = useState<"content" | "assessments" | "attendance" | "announcements">("content");
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [newQuiz, setNewQuiz] = useState({ 
    title: "", 
    dueDate: "",
    questions: [{ text: "", options: ["","","",""], answer: "" }] 
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00", room: "" });

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "" });

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});

  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

  const [editingItem, setEditingItem] = useState<{ type: "MODULE" | "LESSON" | "RESOURCE" | "QUIZ" | "ASSIGNMENT" | "ANNOUNCEMENT", id: string, data: any } | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({ title: "", url: "", type: "PDF" });

  useEffect(() => {
    fetchCourseData();
    fetchAssessments();
    fetchAttendance();
    fetchAnnouncements();
    fetchSchedules();
  }, [offeringId]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teacher/modules?courseOfferingId=${offeringId}`);
      if (res.ok) {
        const data = await res.json();
        setModules(data);
        if (data.length > 0 && !activeModuleId) setActiveModuleId(data[0].id);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const fetchAssessments = async () => {
    try {
      const qRes = await fetch(`/api/teacher/quizzes?courseOfferingId=${offeringId}`);
      if (qRes.ok) setQuizzes(await qRes.json());
      const aRes = await fetch(`/api/teacher/assignments?courseOfferingId=${offeringId}`);
      if (aRes.ok) setAssignments(await aRes.json());
    } catch (e) { console.error(e); }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/teacher/attendance?courseOfferingId=${offeringId}`);
      if (res.ok) setAttendanceSessions(await res.json());
      
      const sRes = await fetch(`/api/teacher/students?courseOfferingId=${offeringId}`);
      if (sRes.ok) {
          const sData = await sRes.json();
          setEnrolledStudents(sData);
          const initialStatuses: any = {};
          sData.forEach((s: any) => initialStatuses[s.id] = "PRESENT");
          setStudentStatuses(initialStatuses);
      }
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
        const res = await fetch(`/api/teacher/announcements?courseOfferingId=${offeringId}`);
        if (res.ok) setAnnouncements(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchSchedules = async () => {
    try {
        const res = await fetch(`/api/teacher/schedule?courseOfferingId=${offeringId}`);
        if (res.ok) setSchedules(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    const res = await fetch("/api/teacher/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newModuleTitle, courseOfferingId: offeringId })
    });
    if (res.ok) { setNewModuleTitle(""); fetchCourseData(); }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle.trim()) return;
    const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newLessonTitle, moduleId })
    });
    if (res.ok) { setNewLessonTitle(""); fetchCourseData(); }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLessonId) return;
    const res = await fetch("/api/teacher/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newResource, lessonId: activeLessonId })
    });
    if (res.ok) { 
        setIsResourceModalOpen(false); 
        setNewResource({ title: "", url: "", type: "PDF" });
        fetchCourseData(); 
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch("/api/teacher/quizzes", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newQuiz, courseOfferingId: offeringId })
      });
      if (res.ok) { 
        setIsQuizModalOpen(false); 
        setNewQuiz({ title: "", dueDate: "", questions: [{ text: "", options: ["","","",""], answer: "" }] }); 
        fetchAssessments(); 
      }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch("/api/teacher/assignments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newAssignment, courseOfferingId: offeringId })
      });
      if (res.ok) { setIsAssignmentModalOpen(false); setNewAssignment({ title: "", description: "", dueDate: "" }); fetchAssessments(); }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const studentsToSubmit = enrolledStudents.map(s => ({ id: s.id, status: studentStatuses[s.id] }));
      const res = await fetch("/api/teacher/attendance", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseOfferingId: offeringId, date: attendanceDate, students: studentsToSubmit })
      });
      if (res.ok) { setIsAttendanceModalOpen(false); fetchAttendance(); }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch("/api/teacher/announcements", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newAnnouncement, courseOfferingId: offeringId })
      });
      if (res.ok) { setIsAnnouncementModalOpen(false); setNewAnnouncement({ title: "", content: "" }); fetchAnnouncements(); }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const res = await fetch("/api/teacher/schedule", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newSchedule, courseOfferingId: offeringId })
      });
      if (res.ok) { setIsScheduleModalOpen(false); fetchSchedules(); }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    let url = "";
    let body = { id: editingItem.id, ...editingItem.data };

    switch (editingItem.type) {
        case "MODULE": url = "/api/teacher/modules"; break;
        case "LESSON": url = "/api/teacher/lessons"; break;
        case "RESOURCE": url = "/api/teacher/lessons"; body = { ...body, type: "RESOURCE" }; break;
        case "ANNOUNCEMENT": url = "/api/teacher/announcements"; break;
        case "ASSIGNMENT": url = "/api/teacher/assignments"; break;
        case "QUIZ": url = "/api/teacher/quizzes"; break;
    }

    const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    if (res.ok) {
        setEditingItem(null);
        fetchCourseData();
        fetchAssessments();
        fetchAnnouncements();
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return;
    let url = "";
    switch (type) {
        case "MODULE": url = `/api/teacher/modules?id=${id}`; break;
        case "LESSON": url = `/api/teacher/lessons?id=${id}`; break;
        case "RESOURCE": url = `/api/teacher/lessons?id=${id}&type=RESOURCE`; break;
        case "ANNOUNCEMENT": url = `/api/teacher/announcements?id=${id}`; break;
        case "ASSIGNMENT": url = `/api/teacher/assignments?id=${id}`; break;
        case "QUIZ": url = `/api/teacher/quizzes?id=${id}`; break;
    }

    const res = await fetch(url, { method: "DELETE" });
    if (res.ok) {
        fetchCourseData();
        fetchAssessments();
        fetchAnnouncements();
    }
  };

  const activeModule = modules.find(m => m.id === activeModuleId);

  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden text-slate-900">
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <Link href="/teacher" className="text-slate-400 hover:text-slate-900 transition font-bold text-sm">&larr; Back</Link>
           <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest">Builder</h2>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button onClick={() => setActiveTab("content")} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>CONTENT</button>
                <button onClick={() => setActiveTab("assessments")} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'assessments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>ASSESS</button>
                <button onClick={() => setActiveTab("announcements")} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>NEWS</button>
                <button onClick={() => setActiveTab("attendance")} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>STATS</button>
            </div>
            <button onClick={() => setActiveTab("attendance" as any)} className={`w-full py-3 text-[10px] font-black rounded-xl transition-all text-left px-4 ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>ATTENDANCE</button>
            <button onClick={() => setActiveTab("content" as any)} className="hidden"></button> {/* Spacer */}
            <button onClick={() => setActiveTab("assessments" as any)} className="hidden"></button> {/* Spacer */}
            <button onClick={() => (setActiveTab as any)("schedule")} className={`w-full py-3 text-[10px] font-black rounded-xl transition-all text-left px-4 ${activeTab === ('schedule' as any) ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>LECTURE SCHEDULE</button>

            {activeTab === 'content' ? (
                <>
                    <h3 className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">Content Modules</h3>
                    {modules.map(m => (
                        <div key={m.id} className="group flex items-center gap-2">
                            <button onClick={() => setActiveModuleId(m.id)} className={`flex-1 text-left px-4 py-3 rounded-2xl transition-all duration-200 flex items-center justify-between ${activeModuleId === m.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'hover:bg-slate-100 text-slate-600 font-bold'}`}>
                                <span className="truncate">{m.title}</span>
                            </button>
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => setEditingItem({ type: "MODULE", id: m.id, data: { title: m.title } })} className="p-1 hover:bg-slate-200 rounded text-slate-400">✏️</button>
                                <button onClick={() => handleDelete("MODULE", m.id)} className="p-1 hover:bg-rose-100 rounded text-rose-400">🗑️</button>
                            </div>
                        </div>
                    ))}
                    <div className="mt-6 px-4">
                        <input type="text" placeholder="+ New Module" className="w-full bg-transparent border-b border-slate-200 py-2 text-sm outline-none focus:border-indigo-500 font-medium" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddModule()} />
                    </div>
                </>
            ) : activeTab === 'assessments' ? (
                 <div className="px-4 py-4 space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quizzes</h3>
                        {quizzes.map(q => <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 mb-2 truncate">{q.title}</div>)}
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assignments</h3>
                        {assignments.map(a => <div key={a.id} className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 mb-2 truncate">{a.title}</div>)}
                    </div>
                 </div>
            ) : activeTab === 'announcements' ? (
                <div className="px-4 py-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Latest News</h3>
                    {announcements.map(n => <div key={n.id} className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 mb-2 truncate">{n.title}</div>)}
                    <button onClick={() => setIsAnnouncementModalOpen(true)} className="w-full mt-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-xl">POST UPDATE</button>
                </div>
            ) : (
                <div className="px-4 py-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sessions</h3>
                    {attendanceSessions.map(s => <div key={s.id} className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 mb-2">{new Date(s.date).toLocaleDateString()}</div>)}
                </div>
            )}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-white">
        {activeTab === 'content' ? (
            activeModule ? (
                <div className="max-w-4xl mx-auto p-12">
                    <header className="mb-12">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">{activeModule.title}</span>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-4">Module Content</h1>
                    </header>
                    <div className="space-y-12">
                        {activeModule.lessons.map((lesson, idx) => (
                            <section key={lesson.id} className="relative pl-12 border-l-4 border-slate-100 group">
                                <div className="absolute -left-6 top-0 w-12 h-12 rounded-2xl bg-white border-4 border-slate-100 flex items-center justify-center font-black text-slate-300 group-hover:border-indigo-500 transition-all">{idx + 1}</div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{lesson.title}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingItem({ type: "LESSON", id: lesson.id, data: { title: lesson.title } })} className="text-xs text-slate-400 hover:text-indigo-600 font-bold">Edit</button>
                                            <button onClick={() => handleDelete("LESSON", lesson.id)} className="text-xs text-slate-400 hover:text-rose-600 font-bold">Delete</button>
                                        </div>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setActiveLessonId(lesson.id);
                                        setIsResourceModalOpen(true);
                                      }} 
                                      className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-xl shadow-slate-200"
                                    >
                                      + Add Resource
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {lesson.resources.map(res => (
                                        <div key={res.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">📄</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{res.title}</p>
                                                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{res.type}</p>
                                                <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest">{res.fileUrl.split('/').pop()}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditingItem({ type: "RESOURCE", id: res.id, data: { title: res.title } })} className="p-1 hover:bg-slate-100 rounded">✏️</button>
                                                <button onClick={() => handleDelete("RESOURCE", res.id)} className="p-1 hover:bg-rose-50 rounded">🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                        <div className="pt-12 border-t border-slate-50">
                            <div className="max-w-md">
                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Add New Lesson</h4>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Lesson title" className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none font-medium transition" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} />
                                    <button onClick={() => handleAddLesson(activeModule.id)} className="px-6 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition">ADD</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-center p-12">
                    <div className="max-w-md">
                        <div className="text-7xl mb-8 grayscale">📁</div>
                        <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Empty Curriculum</h2>
                    </div>
                </div>
            )
        ) : activeTab === 'assessments' ? (
            <div className="max-w-5xl mx-auto p-12">
                 <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Assessments</h1>
                        <p className="text-slate-500 mt-2 font-medium">Manage evaluations.</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => setIsQuizModalOpen(true)} className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition">New Quiz</button>
                        <button onClick={() => setIsAssignmentModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">New Assignment</button>
                    </div>
                </header>
                <div className="space-y-16">
                     <section>
                          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Quizzes</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {quizzes.map(q => (
                                 <div key={q.id} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition duration-500 flex justify-between items-start">
                                     <div>
                                         <h3 className="text-xl font-black text-slate-800 mb-2">{q.title}</h3>
                                         <p className="text-sm text-slate-400 font-medium">{q.dueDate ? `Due: ${new Date(q.dueDate).toLocaleDateString()}` : 'No deadline'}</p>
                                     </div>
                                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => setEditingItem({ type: "QUIZ", id: q.id, data: { title: q.title, questions: q.questions, dueDate: q.dueDate } })} className="p-2 hover:bg-slate-100 rounded-xl">✏️</button>
                                         <button onClick={() => handleDelete("QUIZ", q.id)} className="p-2 hover:bg-rose-50 rounded-xl">🗑️</button>
                                     </div>
                                 </div>
                             ))}
                          </div>
                     </section>
                     <section>
                          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Assignments</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {assignments.map(a => (
                                 <div key={a.id} className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition duration-500 flex justify-between items-start">
                                     <div className="flex-1 min-w-0">
                                         <h3 className="text-xl font-black text-slate-800 mb-2">{a.title}</h3>
                                         <p className="text-sm text-slate-400 font-medium truncate">{a.description}</p>
                                         <p className="text-[10px] text-indigo-500 font-black mt-2 uppercase">{a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString()}` : 'No deadline'}</p>
                                     </div>
                                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => setEditingItem({ type: "ASSIGNMENT", id: a.id, data: { title: a.title, description: a.description, dueDate: a.dueDate } })} className="p-2 hover:bg-slate-100 rounded-xl">✏️</button>
                                         <button onClick={() => handleDelete("ASSIGNMENT", a.id)} className="p-2 hover:bg-rose-50 rounded-xl">🗑️</button>
                                     </div>
                                 </div>
                             ))}
                          </div>
                     </section>
                </div>
            </div>
        ) : activeTab === 'announcements' ? (
            <div className="max-w-5xl mx-auto p-12">
                 <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Announcements</h1>
                        <p className="text-slate-500 mt-2 font-medium">Post updates to your students.</p>
                    </div>
                    <button onClick={() => setIsAnnouncementModalOpen(true)} className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-100">Create New Update</button>
                </header>
                <div className="space-y-8">
                     {announcements.map(n => (
                          <div key={n.id} className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-100/50 flex justify-between items-start">
                              <div className="flex-1">
                                 <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-black text-slate-800">{n.title}</h3>
                                    <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 <p className="text-slate-600 font-medium leading-relaxed">{n.content}</p>
                              </div>
                              <div className="flex flex-col gap-2 ml-8 opacity-0 group-hover:opacity-100 transition">
                                  <button onClick={() => setEditingItem({ type: "ANNOUNCEMENT", id: n.id, data: { title: n.title, content: n.content } })} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl">✏️</button>
                                  <button onClick={() => handleDelete("ANNOUNCEMENT", n.id)} className="p-3 bg-rose-50 hover:bg-rose-100 rounded-2xl">🗑️</button>
                              </div>
                          </div>
                     ))}
                </div>
            </div>
        ) : (
            <div className="max-w-5xl mx-auto p-12">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Attendance Stats</h1>
                        <p className="text-slate-500 mt-2 font-medium">Track student presence.</p>
                    </div>
                    <button onClick={() => setIsAttendanceModalOpen(true)} className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition">Mark New Session</button>
                </header>
                     {attendanceSessions.map((s: any) => (
                         <div key={s.id} className="bg-white p-8 rounded-3xl border border-slate-100 flex flex-col items-center">
                             <div className="text-4xl mb-4">🗓️</div>
                             <p className="font-black text-slate-900">{new Date(s.date).toLocaleDateString()}</p>
                             <p className="text-xs font-bold text-slate-400 mt-2 uppercase">{s.records?.length || 0} Students Present</p>
                         </div>
                     ))}
            </div>
        )}
      </main>

      {/* MODALS */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border border-slate-100">
            <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Broadcast Update</h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-6">
              <input type="text" required placeholder="Announcement Title" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
              <textarea required placeholder="Content details..." rows={6} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} />
              <div className="flex justify-end gap-4 pt-8"><button type="button" onClick={() => setIsAnnouncementModalOpen(false)}>Cancel</button><button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl">Post Announcement</button></div>
            </form>
          </div>
        </div>
      )}

      {isAssignmentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border border-slate-100">
            <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">New Assignment</h3>
            <form onSubmit={handleAssignmentSubmit} className="space-y-6">
              <input type="text" required placeholder="Title" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} />
              <textarea required placeholder="Description..." rows={4} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none" value={newAssignment.description} onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} />
              <input type="datetime-local" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newAssignment.dueDate} onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})} />
              <div className="flex justify-end gap-4 pt-8"><button type="button" onClick={() => setIsAssignmentModalOpen(false)}>Cancel</button><button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Mark Attendance</h3>
            <form onSubmit={handleAttendanceSubmit} className="space-y-8">
               <input type="date" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
               <div className="space-y-4">
                  {enrolledStudents.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <div><p className="font-black text-slate-900">{s.name}</p><p className="text-[10px] text-slate-400">{s.email}</p></div>
                          <select className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold" value={studentStatuses[s.id]} onChange={(e) => setStudentStatuses({...studentStatuses, [s.id]: e.target.value as any})}>
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                              <option value="LATE">LATE</option>
                          </select>
                      </div>
                  ))}
               </div>
               <div className="flex justify-end gap-4 pt-8"><button type="button" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</button><button type="submit" className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl">Record Presence</button></div>
            </form>
          </div>
        </div>
      )}
      
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <header className="flex justify-between items-center mb-10">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Quiz Construction</h3>
                <button onClick={() => setIsQuizModalOpen(false)} className="text-slate-300 hover:text-slate-900 text-2xl">×</button>
            </header>
            
            <form onSubmit={handleQuizSubmit} className="space-y-10">
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz Title</label>
                    <input type="text" required placeholder="e.g., Midterm Assessment" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newQuiz.title} onChange={(e) => setNewQuiz({...newQuiz, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deadline (Optional)</label>
                    <input type="datetime-local" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newQuiz.dueDate} onChange={(e) => setNewQuiz({...newQuiz, dueDate: e.target.value})} />
                  </div>
              </div>

              <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Questions ({newQuiz.questions.length})</h4>
                    <button type="button" onClick={() => setNewQuiz({...newQuiz, questions: [...newQuiz.questions, { text: "", options: ["","","",""], answer: "" }]})} className="text-xs font-black text-indigo-600 hover:underline">+ ADD QUESTION</button>
                  </div>
                  
                  {newQuiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative">
                        <button type="button" onClick={() => {
                            const qs = [...newQuiz.questions];
                            qs.splice(qIdx, 1);
                            setNewQuiz({...newQuiz, questions: qs});
                        }} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500">Remove</button>
                        
                        <div className="space-y-6">
                            <input required placeholder={`Question ${qIdx + 1} text...`} className="w-full bg-white px-6 py-4 rounded-xl font-bold shadow-sm" value={q.text} onChange={(e) => {
                                const qs = [...newQuiz.questions];
                                qs[qIdx].text = e.target.value;
                                setNewQuiz({...newQuiz, questions: qs});
                            }} />
                            
                            <div className="grid grid-cols-2 gap-4">
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex gap-2">
                                        <input required placeholder={`Option ${oIdx + 1}`} className="flex-1 bg-white px-4 py-3 rounded-xl text-sm font-medium border border-slate-100" value={opt} onChange={(e) => {
                                            const qs = [...newQuiz.questions];
                                            qs[qIdx].options[oIdx] = e.target.value;
                                            setNewQuiz({...newQuiz, questions: qs});
                                        }} />
                                        <button type="button" onClick={() => {
                                            const qs = [...newQuiz.questions];
                                            qs[qIdx].answer = opt;
                                            setNewQuiz({...newQuiz, questions: qs});
                                        }} className={`px-3 rounded-xl text-[10px] font-black ${q.answer === opt ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                            {q.answer === opt ? '✓' : 'SET'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsQuizModalOpen(false)} className="px-8 py-4 font-bold text-slate-400">Discard</button>
                <button type="submit" className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-600 transition-all">Publish Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl">
            <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Define Slot</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.dayOfWeek} onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: e.target.value})}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.startTime} onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})} />
                    <input type="time" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.endTime} onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})} />
                </div>
                <input type="text" placeholder="Room (e.g., CS-102)" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newSchedule.room} onChange={(e) => setNewSchedule({...newSchedule, room: e.target.value})} />
              </div>
              <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl">Add Slot</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-8 uppercase">Edit {editingItem.type}</h3>
            <div className="space-y-6">
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  value={editingItem.data.title}
                  onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, title: e.target.value } })}
                />
                {editingItem.type === "ANNOUNCEMENT" && (
                     <textarea 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none"
                        rows={4}
                        value={editingItem.data.content}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, content: e.target.value } })}
                    />
                )}
                {editingItem.type === "ASSIGNMENT" && (
                     <>
                        <textarea 
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold resize-none"
                            rows={4}
                            value={editingItem.data.description}
                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                        />
                        <input 
                            type="datetime-local"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                            value={editingItem.data.dueDate ? new Date(editingItem.data.dueDate).toISOString().slice(0, 16) : ""}
                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, dueDate: e.target.value } })}
                        />
                     </>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={() => setEditingItem(null)} className="px-6 py-3 font-bold text-slate-400">Cancel</button>
                    <button onClick={handleUpdate} className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl">Save Changes</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {isResourceModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-xl border border-slate-100">
                <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Attach Resource</h3>
                <form onSubmit={handleResourceSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Resource Title</label>
                        <input type="text" required placeholder="e.g., Week 1 Lecture Slides" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newResource.title} onChange={(e) => setNewResource({...newResource, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">External Link / URL</label>
                        <input type="url" required placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newResource.url} onChange={(e) => setNewResource({...newResource, url: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Content Type</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={newResource.type} onChange={(e) => setNewResource({...newResource, type: e.target.value})}>
                            <option value="PDF">Document (PDF)</option>
                            <option value="VIDEO">Video Lecture</option>
                            <option value="DOC">Word / Doc</option>
                            <option value="LINK">External Link</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4 pt-8">
                        <button type="button" onClick={() => setIsResourceModalOpen(false)} className="px-6 py-4 font-bold text-slate-400">Cancel</button>
                        <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition">Publish Resource</button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
}
