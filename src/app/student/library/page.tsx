"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Resource = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
};

type Lesson = {
  id: string;
  title: string;
  resources: Resource[];
};

type Module = {
  id: string;
  title: string;
  lessons: Lesson[];
};

type OfferingResources = {
  courseCode: string;
  courseTitle: string;
  modules: Module[];
};

export default function LibraryPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<OfferingResources[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const courseRes = await fetch("/api/student/courses");
        if (courseRes.ok) {
          const courses = await courseRes.json();
          const libraryData = await Promise.all(courses.map(async (c: any) => {
            const modRes = await fetch(`/api/student/modules?courseOfferingId=${c.id}`);
            const modules = modRes.ok ? await modRes.json() : [];
            return {
              courseCode: c.course.code,
              courseTitle: c.course.title,
              modules: modules
            };
          }));
          setData(libraryData.filter(d => d.modules.length > 0));
        }
      } catch (e) {
         console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) fetchLibrary();
  }, [session]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 lg:p-24 overflow-x-hidden">
       <Link href="/student" className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-indigo-600 transition mb-12 inline-flex items-center gap-2 group italic">
         <span className="text-lg group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
       </Link>
       
       <header className="mb-16 md:mb-24">
            <div className="flex items-end gap-2 mb-4">
               <h1 className="text-5xl md:text-8xl font-black text-slate-800 tracking-tighter leading-none italic uppercase">Knowledge <br/><span className="text-indigo-600">Vault.</span></h1>
            </div>
            <p className="text-slate-400 font-bold text-lg md:text-2xl mt-4">Direct access to your department's learning materials.</p>
       </header>

       {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3].map(n => <div key={n} className="h-64 bg-white rounded-[48px] animate-pulse border border-slate-100 shadow-sm" />)}
         </div>
       ) : data.length === 0 ? (
         <div className="bg-white rounded-[56px] p-24 text-center shadow-3xl shadow-indigo-100/30 border border-white max-w-4xl mx-auto">
            <div className="text-8xl mb-8">📥</div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight leading-none uppercase">The vault is empty.</h2>
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed font-bold text-lg">
                Resources will appear here once your instructors upload lecture materials and modules.
            </p>
         </div>
       ) : (
         <div className="space-y-24">
           {data.map((offering, idx) => (
             <section key={idx} className="animate-in fade-in slide-in-from-bottom duration-700">
               <div className="flex justify-between items-end mb-10 border-b border-slate-100 pb-8">
                 <div>
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2 block">{offering.courseCode}</span>
                   <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase italic">{offering.courseTitle}</h2>
                 </div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{offering.modules.length} MODULES</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {offering.modules.map(mod => (
                   <div key={mod.id} className="group bg-white p-10 rounded-[48px] border border-white shadow-2xl shadow-indigo-100/20 hover:shadow-3xl transition-all duration-500 hover:-translate-y-3">
                     <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">📁</div>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Module</span>
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 mb-6 leading-tight tracking-tighter group-hover:text-indigo-600 transition-colors uppercase italic">{mod.title}</h3>
                     
                     <div className="space-y-4">
                       {mod.lessons.map(lesson => (
                         <div key={lesson.id} className="pt-4 mt-4 border-t border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Lesson: {lesson.title}</p>
                            <div className="flex flex-wrap gap-2">
                               {lesson.resources.map(res => (
                                 <a 
                                   key={res.id} 
                                   href={res.fileUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="px-3 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-indigo-600 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest border border-slate-100"
                                 >
                                    {res.type}
                                 </a>
                               ))}
                               {lesson.resources.length === 0 && <span className="text-[9px] text-slate-300 italic font-medium">No files attached</span>}
                            </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           ))}
         </div>
       )}
    </div>
  );
}
